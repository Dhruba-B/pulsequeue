import redis
    from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";

import {
    JOB_STATUS
} from "../../../../packages/shared/src/constants/jobConstants.js";

const WORKER_TIMEOUT = 15000;

export const startRecoveryScanner = async () => {

    console.log("Recovery Scanner Started");

    setInterval(async () => {

        try {

            const workers = await redis.hgetall(
                REDIS_KEYS.WORKER_HEARTBEATS
            );

            const now = Date.now();

            for (const workerId in workers) {

                const lastHeartbeat =
                    Number(workers[workerId]);

                const isDead =
                    now - lastHeartbeat >
                    WORKER_TIMEOUT;

                if (!isDead) {
                    continue;
                }

                console.log(
                    `Dead worker detected: ${workerId}`
                );

                // Find worker job
                const jobId = await redis.hget(
                    REDIS_KEYS.WORKER_JOBS,
                    workerId
                );

                if (!jobId) {

                    await redis.hdel(
                        REDIS_KEYS.WORKER_HEARTBEATS,
                        workerId
                    );

                    continue;
                }

                const jobData = await redis.hget(
                    REDIS_KEYS.JOB_DATA,
                    jobId
                );

                if (!jobData) {
                    continue;
                }

                const job = JSON.parse(jobData);

                // Requeue job
                job.status = JOB_STATUS.WAITING;

                job.workerId = null;

                await redis.hset(
                    REDIS_KEYS.JOB_DATA,
                    job.id,
                    JSON.stringify(job)
                );

                await redis.lpush(
                    REDIS_KEYS.WAITING_HIGH,
                    job.id
                );

                // Cleanup
                await redis.hdel(
                    REDIS_KEYS.ACTIVE_JOBS,
                    job.id
                );

                await redis.hdel(
                    REDIS_KEYS.WORKER_JOBS,
                    workerId
                );

                await redis.hdel(
                    REDIS_KEYS.WORKER_HEARTBEATS,
                    workerId
                );

                console.log(
                    `Recovered job: ${job.id}`
                );
            }

        } catch (error) {

            console.log(
                "Recovery Scanner Error:",
                error
            );
        }

    }, 60000);
};