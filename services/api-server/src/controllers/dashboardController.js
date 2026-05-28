import redis
    from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";

const AI_JOB_TYPES = ["SUMMARIZE", "EMBED", "OCR", "TRANSLATE", "CLASSIFY"];

const WORKER_STALE_AFTER_MS = 15000;

const parseJson = (value, fallback = null) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const duration = (start, end) => {
    if (!start || !end) {
        return null;
    }

    return Math.max(0, Number(end) - Number(start));
};

const getResultSize = (job) => {
    if (!job?.result) {
        return 0;
    }

    if (Array.isArray(job.result.embedding)) {
        return job.result.embedding.length;
    }

    return JSON.stringify(job.result).length;
};

const buildLatencyBuckets = (jobs) => {
    const buckets = [
        { range: "<1s", min: 0, max: 1000, count: 0 },
        { range: "1-5s", min: 1000, max: 5000, count: 0 },
        { range: "5-15s", min: 5000, max: 15000, count: 0 },
        { range: "15-60s", min: 15000, max: 60000, count: 0 },
        { range: ">60s", min: 60000, max: Infinity, count: 0 },
    ];

    jobs.forEach((job) => {
        const latency =
            job.executionLatency ||
            duration(job.processedAt, job.completedAt);

        if (latency == null) {
            return;
        }

        const bucket = buckets.find(
            (item) => latency >= item.min && latency < item.max
        );

        if (bucket) {
            bucket.count += 1;
        }
    });

    return buckets.map(({ range, count }) => ({ range, count }));
};

const buildAiMetrics = ({ jobs, workers, waiting, activeWorkers }) => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const aiJobs = jobs.filter((job) => AI_JOB_TYPES.includes(job.type));
    const completedAiJobs = aiJobs.filter((job) => job.status === "COMPLETED");
    const failedAiJobs = aiJobs.filter((job) => job.status === "FAILED");
    const recentCompleted = completedAiJobs.filter(
        (job) => Number(job.completedAt || 0) >= oneMinuteAgo
    );
    const latencies = completedAiJobs
        .map((job) => job.executionLatency || duration(job.processedAt, job.completedAt))
        .filter((value) => value != null);
    const activeAiWorkers = workers.filter((worker) => worker.isAlive);
    const activeWorkerJobs = workers.filter((worker) => worker.currentJob).length;
    const totalFinished = completedAiJobs.length + failedAiJobs.length;

    const jobDistribution = AI_JOB_TYPES.map((type) => ({
        type,
        count: aiJobs.filter((job) => job.type === type).length,
    }));

    const workerDistribution = ["LLM", "OCR", "EMBED", "GENERAL"].map((type) => ({
        type,
        count: workers.filter((worker) => worker.type === type).length,
    }));

    return {
        aiJobsPerSecond: Number((recentCompleted.length / 60).toFixed(2)),
        inferenceLatency:
            latencies.length > 0
                ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
                : 0,
        ocrThroughput: recentCompleted.filter((job) => job.type === "OCR").length,
        embeddingsGenerated: completedAiJobs.filter((job) => job.type === "EMBED").length,
        tokenThroughput: recentCompleted.reduce((sum, job) => {
            const text = [
                job.payload?.text,
                job.result?.summary,
                job.result?.translated,
                job.result?.text,
            ]
                .filter(Boolean)
                .join(" ");

            return sum + text.split(/\s+/).filter(Boolean).length;
        }, 0),
        activeAiWorkers: activeAiWorkers.length,
        queueSaturation:
            activeWorkers > 0
                ? Math.round((waiting.total / Math.max(waiting.total + activeWorkers, 1)) * 100)
                : waiting.total > 0 ? 100 : 0,
        workerUtilization:
            activeWorkers > 0
                ? Math.round((activeWorkerJobs / activeWorkers) * 100)
                : 0,
        jobSuccessRate:
            totalFinished > 0
                ? Math.round((completedAiJobs.length / totalFinished) * 100)
                : 100,
        resultBytes: completedAiJobs.reduce((sum, job) => sum + getResultSize(job), 0),
        jobDistribution,
        workerDistribution,
        latencyHistogram: buildLatencyBuckets(completedAiJobs),
        queueDepth: [
            { queue: "High", depth: Number(waiting.high || 0) },
            { queue: "Medium", depth: Number(waiting.medium || 0) },
            { queue: "Low", depth: Number(waiting.low || 0) },
        ],
        utilizationByWorker: workers.map((worker) => ({
            workerId: worker.workerId?.slice(0, 8),
            utilization: worker.currentJob ? 100 : 0,
            type: worker.type || "GENERAL",
        })),
    };
};

const loadWorkers = async () => {
    const [
        heartbeats,
        workerJobs,
        managedWorkers,
        workerRecords,
        capabilityRecords,
        metricRecords,
    ] = await Promise.all([
        redis.hgetall(REDIS_KEYS.WORKER_HEARTBEATS),
        redis.hgetall(REDIS_KEYS.WORKER_JOBS),
        redis.hgetall(REDIS_KEYS.MANAGED_WORKERS),
        redis.hgetall(REDIS_KEYS.WORKERS),
        redis.hgetall(REDIS_KEYS.WORKER_CAPABILITIES),
        redis.hgetall(REDIS_KEYS.WORKER_METRICS),
    ]);

    const now = Date.now();
    const workersById = new Map();

    const upsert = (workerId, patch) => {
        workersById.set(workerId, {
            ...(workersById.get(workerId) || { workerId }),
            ...patch,
        });
    };

    Object.entries(workerRecords).forEach(([workerId, raw]) => {
        upsert(workerId, parseJson(raw, { workerId }));
    });

    Object.entries(capabilityRecords).forEach(([workerId, raw]) => {
        upsert(workerId, {
            capabilities: parseJson(raw, []),
        });
    });

    Object.entries(metricRecords).forEach(([workerId, raw]) => {
        upsert(workerId, parseJson(raw, { workerId }));
    });

    Object.entries(heartbeats).forEach(([workerId, lastSeen]) => {
        upsert(workerId, {
            lastSeen: Number(lastSeen),
            isAlive: now - Number(lastSeen) < WORKER_STALE_AFTER_MS,
        });
    });

    Object.entries(workerJobs).forEach(([workerId, currentJob]) => {
        upsert(workerId, { currentJob });
    });

    Object.values(managedWorkers).forEach((worker) => {
        const managedWorker = parseJson(worker, {});
        if (!managedWorker.workerId) {
            return;
        }

        upsert(managedWorker.workerId, {
            ...managedWorker,
            managed: true,
            controlStatus: managedWorker.status,
        });
    });

    return Array.from(workersById.values())
        .map((worker) => {
            const isAlive =
                worker.isAlive ??
                worker.controlStatus === "RUNNING";

            return {
                workerId: worker.workerId,
                type: worker.type || "GENERAL",
                capabilities: worker.capabilities || [],
                currentJob: worker.currentJob || null,
                status: isAlive ? (worker.currentJob ? "EXECUTING" : "ONLINE") : "OFFLINE",
                healthStatus: worker.healthStatus || (isAlive ? "HEALTHY" : "UNREACHABLE"),
                uptime: worker.startedAt ? Date.now() - Number(worker.startedAt) : 0,
                startedAt: worker.startedAt || null,
                jobsProcessed: Number(worker.jobsProcessed || 0),
                processedJobs: Number(worker.jobsProcessed || worker.processedJobs || 0),
                averageExecutionLatency: Number(worker.averageExecutionLatency || 0),
                loadedModel: worker.loadedModel || "unloaded",
                lastCompletedJob: worker.lastCompletedJob || null,
                queueAffinity: worker.queueAffinity || worker.capabilities || [],
                activeJobs: Number(worker.activeJobs || (worker.currentJob ? 1 : 0)),
                lastSeen: worker.lastSeen || worker.updatedAt || worker.startedAt || null,
                isAlive,
                managed: Boolean(worker.managed),
                controlStatus: worker.controlStatus,
            };
        })
        .sort((a, b) => Number(b.lastSeen || 0) - Number(a.lastSeen || 0));
};

const loadJobs = async () => {
    const jobs = await redis.hgetall(REDIS_KEYS.JOB_DATA);

    return Object.values(jobs)
        .map((job) => parseJson(job))
        .filter(Boolean);
};

export const getSystemStats = async (req, res) => {

    try {

        const [
            waitingHigh,
            waitingMedium,
            waitingLow,
            completed,
            failed,
            delayed,
            activeWorkers,
            jobs,
            workers
        ] = await Promise.all([

            redis.llen(
                REDIS_KEYS.WAITING_HIGH
            ),

            redis.llen(
                REDIS_KEYS.WAITING_MEDIUM
            ),

            redis.llen(
                REDIS_KEYS.WAITING_LOW
            ),

            redis.llen(
                REDIS_KEYS.COMPLETED
            ),

            redis.llen(
                REDIS_KEYS.FAILED
            ),

            redis.zcard(
                REDIS_KEYS.DELAYED
            ),

            redis.hlen(
                REDIS_KEYS.WORKER_HEARTBEATS
            ),

            loadJobs(),

            loadWorkers()
        ]);

        const activeWorkerCount = workers.filter((worker) => worker.isAlive).length;

        const waiting = {
            high: waitingHigh,
            medium: waitingMedium,
            low: waitingLow,
            total:
                waitingHigh +
                waitingMedium +
                waitingLow,
        };

        return res.json({

            success: true,

            data: {

                waiting: waiting.total,

                completed,

                failed,

                delayed,

                activeWorkers: activeWorkerCount,

                ai: buildAiMetrics({
                    jobs,
                    workers,
                    waiting,
                    activeWorkers: activeWorkerCount,
                })
            }
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false
        });
    }
};


export const getJobs = async (req, res) => {

    try {

        const {
            status,
            search = "",
            page = 1,
            limit = 20
        } = req.query;

        let parsedJobs = (await loadJobs())
            .filter((job) => AI_JOB_TYPES.includes(job.type));

        // Filter by status
        if (status) {

            parsedJobs =
                parsedJobs.filter(
                    job =>
                        job.status === status
                );
        }

        // Search
        if (search) {

            parsedJobs =
                parsedJobs.filter(job =>

                    job.id.includes(search)
                    ||

                    job.type.includes(search)
                );
        }

        // Sort newest first
        parsedJobs.sort(
            (a, b) =>
                b.createdAt -
                a.createdAt
        );

        // Pagination
        const start =
            (page - 1) * limit;

        const paginatedJobs =
            parsedJobs.slice(
                start,
                start + Number(limit)
            );

        return res.json({

            success: true,

            data: paginatedJobs,

            total: parsedJobs.length
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false
        });
    }
};

export const getWorkers = async (req, res) => {
    try {
        const parsedWorkers = await loadWorkers();

        return res.json({
            success: true,
            data: parsedWorkers,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
        });
    }
};
