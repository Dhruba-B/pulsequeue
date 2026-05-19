import redis
    from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";

import {
    JOB_PRIORITY,
    JOB_STATUS
} from "../../../../packages/shared/src/constants/jobConstants.js";

export const startDelayedScheduler = async () => {

    console.log("Delayed Scheduler Started");

    while (true) {

        try {

            const now = Date.now();

            // Get ready jobs
            const readyJobs = await redis.zrangebyscore(
                REDIS_KEYS.DELAYED,
                0,
                now
            );

            for (const jobId of readyJobs) {

                const jobData = await redis.hget(
                    REDIS_KEYS.JOB_DATA,
                    jobId
                );

                if (!jobData) {
                    continue;
                }

                const job = JSON.parse(jobData);

                // Remove from delayed set
                await redis.zrem(
                    REDIS_KEYS.DELAYED,
                    jobId
                );

                // Update status
                job.status = JOB_STATUS.WAITING;

                job.runAt = null;

                await redis.hset(
                    REDIS_KEYS.JOB_DATA,
                    job.id,
                    JSON.stringify(job)
                );

                // Requeue based on priority
                switch (job.priority) {

                    case JOB_PRIORITY.HIGH:

                        await redis.lpush(
                            REDIS_KEYS.WAITING_HIGH,
                            job.id
                        );

                        break;

                    case JOB_PRIORITY.MEDIUM:

                        await redis.lpush(
                            REDIS_KEYS.WAITING_MEDIUM,
                            job.id
                        );

                        break;

                    case JOB_PRIORITY.LOW:

                        await redis.lpush(
                            REDIS_KEYS.WAITING_LOW,
                            job.id
                        );

                        break;
                }

                console.log(
                    `Requeued delayed job: ${job.id}`
                );
            }

        } catch (error) {

            console.log(
                "Scheduler Error:",
                error
            );
        }

        await new Promise((resolve) =>
            setTimeout(resolve, 1000)
        );
    }
};