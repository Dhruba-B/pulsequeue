import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import redis from "../../../../packages/redis-client/src/index.js";
import { publisher } from "../../../../packages/redis-client/src/pubsub.js";
import { REDIS_KEYS } from "../../../../packages/shared/src/constants/redisKeys.js";
import { EVENT_CHANNELS } from "../../../../packages/shared/src/constants/eventChannels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workerRoot = path.resolve(__dirname, "../../../worker");

const managedProcesses = new Map();

const publishLifecycle = async (event) => {
    const payload = {
        ...event,
        timestamp: event.timestamp || Date.now(),
    };

    await redis.lpush(
        REDIS_KEYS.WORKER_LIFECYCLE_EVENTS,
        JSON.stringify(payload)
    );

    await redis.ltrim(
        REDIS_KEYS.WORKER_LIFECYCLE_EVENTS,
        0,
        99
    );

    await publisher.publish(
        EVENT_CHANNELS.WORKER_LIFECYCLE,
        JSON.stringify(payload)
    );
};

const writeWorkerState = async (workerId, patch) => {
    const existing = await redis.hget(
        REDIS_KEYS.MANAGED_WORKERS,
        workerId
    );

    const current = existing
        ? JSON.parse(existing)
        : {};

    const next = {
        ...current,
        ...patch,
        workerId,
        updatedAt: Date.now(),
    };

    await redis.hset(
        REDIS_KEYS.MANAGED_WORKERS,
        workerId,
        JSON.stringify(next)
    );

    await publisher.publish(
        EVENT_CHANNELS.WORKER_UPDATED,
        JSON.stringify(next)
    );

    return next;
};

export const startManagedWorker = async () => {
    const workerId = `managed-${uuidv4()}`;

    await writeWorkerState(
        workerId,
        {
            status: "STARTING",
            pid: null,
            startedAt: Date.now(),
            stoppedAt: null,
            exitCode: null,
            signal: null,
            managed: true,
        }
    );

    const child = spawn(
        process.execPath,
        ["src/index.js"],
        {
            cwd: workerRoot,
            env: {
                ...process.env,
                PULSEQUEUE_WORKER_ID: workerId,
                PULSEQUEUE_MANAGED_WORKER: "true",
            },
            stdio: ["ignore", "pipe", "pipe"],
            windowsHide: true,
        }
    );

    managedProcesses.set(workerId, child);

    await writeWorkerState(
        workerId,
        {
            status: "RUNNING",
            pid: child.pid,
        }
    );

    await publishLifecycle({
        workerId,
        status: "STARTED",
        pid: child.pid,
        source: "api-server",
    });

    child.stdout.on("data", (data) => {
        console.log(`[${workerId}] ${data.toString().trim()}`);
    });

    child.stderr.on("data", (data) => {
        console.log(`[${workerId}:err] ${data.toString().trim()}`);
    });

    child.on("error", async (error) => {
        managedProcesses.delete(workerId);

        await writeWorkerState(
            workerId,
            {
                status: "ERROR",
                error: error.message,
                stoppedAt: Date.now(),
            }
        );

        await publishLifecycle({
            workerId,
            status: "ERROR",
            error: error.message,
            source: "api-server",
        });
    });

    child.on("exit", async (code, signal) => {
        managedProcesses.delete(workerId);

        await redis.hdel(
            REDIS_KEYS.WORKER_HEARTBEATS,
            workerId
        );

        await redis.hdel(
            REDIS_KEYS.WORKER_JOBS,
            workerId
        );

        const status = code === 0
            ? "STOPPED"
            : "EXITED";

        await writeWorkerState(
            workerId,
            {
                status,
                exitCode: code,
                signal,
                stoppedAt: Date.now(),
            }
        );

        await publishLifecycle({
            workerId,
            status,
            exitCode: code,
            signal,
            source: "api-server",
        });
    });

    return getManagedWorker(workerId);
};

export const stopManagedWorker = async (workerId) => {
    const child = managedProcesses.get(workerId);

    const existing = await redis.hget(
        REDIS_KEYS.MANAGED_WORKERS,
        workerId
    );

    if (!existing) {
        const error = new Error("Worker is not managed by this control plane");
        error.statusCode = 404;
        throw error;
    }

    if (!child) {
        return writeWorkerState(
            workerId,
            {
                status: "STOPPED",
                stoppedAt: Date.now(),
            }
        );
    }

    await writeWorkerState(
        workerId,
        {
            status: "STOPPING",
        }
    );

    await publishLifecycle({
        workerId,
        status: "STOPPING",
        pid: child.pid,
        source: "api-server",
    });

    child.kill("SIGTERM");

    setTimeout(() => {
        if (managedProcesses.has(workerId)) {
            child.kill("SIGKILL");
        }
    }, 30000);

    return getManagedWorker(workerId);
};

export const getManagedWorker = async (workerId) => {
    const worker = await redis.hget(
        REDIS_KEYS.MANAGED_WORKERS,
        workerId
    );

    return worker
        ? JSON.parse(worker)
        : null;
};

export const listManagedWorkers = async () => {
    const workers = await redis.hgetall(
        REDIS_KEYS.MANAGED_WORKERS
    );

    return Object.values(workers)
        .map((worker) => JSON.parse(worker))
        .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
};

export const listWorkerControls = async () => {
    const [
        managedWorkers,
        heartbeats,
        workerJobs
    ] = await Promise.all([
        redis.hgetall(
            REDIS_KEYS.MANAGED_WORKERS
        ),

        redis.hgetall(
            REDIS_KEYS.WORKER_HEARTBEATS
        ),

        redis.hgetall(
            REDIS_KEYS.WORKER_JOBS
        ),
    ]);

    const now = Date.now();
    const workersById = new Map();

    Object.values(managedWorkers).forEach((worker) => {
        const parsedWorker = JSON.parse(worker);

        workersById.set(
            parsedWorker.workerId,
            {
                ...parsedWorker,
                managed: true,
                controllable: true,
            }
        );
    });

    Object.entries(heartbeats).forEach(([workerId, lastSeen]) => {
        const existingWorker = workersById.get(workerId);
        const isAlive = now - Number(lastSeen) < 15000;

        workersById.set(
            workerId,
            {
                ...existingWorker,
                workerId,
                managed: Boolean(existingWorker?.managed),
                controllable: Boolean(existingWorker?.managed),
                status: isAlive
                    ? "RUNNING"
                    : existingWorker?.status || "OFFLINE",
                pid: existingWorker?.pid || null,
                currentJob: workerJobs[workerId] || null,
                lastSeen: Number(lastSeen),
                updatedAt: Number(lastSeen),
            }
        );
    });

    return Array.from(workersById.values())
        .sort((a, b) =>
            Number(b.updatedAt || b.startedAt || 0)
            -
            Number(a.updatedAt || a.startedAt || 0)
        );
};

export const stopAllManagedWorkers = async () => {
    const workers = await listManagedWorkers();
    const activeWorkers = workers.filter(
        (worker) =>
            worker.status === "RUNNING"
            ||
            worker.status === "STARTING"
    );

    await Promise.all(
        activeWorkers.map((worker) =>
            stopManagedWorker(worker.workerId)
        )
    );

    return listManagedWorkers();
};

export const hydrateManagedWorkers = async () => {
    const workers = await listManagedWorkers();

    await Promise.all(
        workers
            .filter((worker) =>
                worker.status === "RUNNING"
                ||
                worker.status === "STARTING"
                ||
                worker.status === "STOPPING"
            )
            .map((worker) =>
                writeWorkerState(
                    worker.workerId,
                    {
                        status: "ORPHANED",
                        stoppedAt: Date.now(),
                    }
                )
            )
    );
};
