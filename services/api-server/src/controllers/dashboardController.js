import redis
    from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";

export const getSystemStats = async (req, res) => {

    try {

        const [
            waitingHigh,
            waitingMedium,
            waitingLow,
            completed,
            failed,
            delayed,
            activeWorkers
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
            )
        ]);

        return res.json({

            success: true,

            data: {

                waiting:
                    waitingHigh +
                    waitingMedium +
                    waitingLow,

                completed,

                failed,

                delayed,

                activeWorkers
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

        const jobs =
            await redis.hgetall(
                REDIS_KEYS.JOB_DATA
            );

        let parsedJobs =
            Object.values(jobs)
                .map(job =>
                    JSON.parse(job)
                );

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
        const workers = await redis.hgetall(REDIS_KEYS.WORKER_HEARTBEATS);

        const workerJobs = await redis.hgetall(REDIS_KEYS.WORKER_JOBS);

        const managedWorkers = await redis.hgetall(REDIS_KEYS.MANAGED_WORKERS);

        const now = Date.now();

        const parsedWorkersById = new Map();

        Object.entries(workers).forEach(
            ([workerId, lastSeen]) => {
                const isAlive = now - Number(lastSeen) < 15000;

                parsedWorkersById.set(workerId, {
                    workerId,

                    lastSeen,

                    isAlive,

                    currentJob: workerJobs[workerId] || null,

                    processedJobs: Math.floor(Math.random() * 500),

                    cpuLoad: Math.floor(Math.random() * 100),

                    memoryUsage: Math.floor(Math.random() * 100),
                });
            },
        );

        Object.values(managedWorkers).forEach((worker) => {
            const managedWorker = JSON.parse(worker);
            const existingWorker = parsedWorkersById.get(managedWorker.workerId);

            parsedWorkersById.set(
                managedWorker.workerId,
                {
                    ...managedWorker,
                    ...existingWorker,
                    managed: true,
                    controlStatus: managedWorker.status,
                    isAlive: existingWorker?.isAlive || managedWorker.status === "RUNNING",
                    currentJob: existingWorker?.currentJob || workerJobs[managedWorker.workerId] || null,
                    lastSeen: existingWorker?.lastSeen || managedWorker.updatedAt,
                    processedJobs: existingWorker?.processedJobs || 0,
                    cpuLoad: existingWorker?.cpuLoad || 0,
                    memoryUsage: existingWorker?.memoryUsage || 0,
                }
            );
        });

        const parsedWorkers = Array.from(parsedWorkersById.values())
            .sort((a, b) => Number(b.lastSeen || 0) - Number(a.lastSeen || 0));

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
