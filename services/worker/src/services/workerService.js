import redis
    from "../../../../packages/redis-client/src/index.js";

import { getNextJob }
    from "./queueConsumer.js";

import { processorMap }
    from "../processors/index.js";

import { retryJob }
    from "./retryService.js";

import {
    JOB_STATUS
} from "../../../../packages/shared/src/constants/jobConstants.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";
import { WORKER_ID } from "../utils/workerIdentity.js";

export const startWorker = async () => {

    console.log("Worker Started");

    while (true) {

        let job = null;

        try {

            const jobId = await getNextJob();

            // No jobs available
            if (!jobId) {

                await new Promise((resolve) =>
                    setTimeout(resolve, 1000)
                );

                continue;
            }

            console.log("Picked Job:", jobId);

            // Fetch job data
            const jobData = await redis.hget(
                REDIS_KEYS.JOB_DATA,
                jobId
            );

            if (!jobData) {

                console.log("Job data missing");

                continue;
            }

            job = JSON.parse(jobData);

            // Mark ACTIVE
            job.status = JOB_STATUS.ACTIVE;

            job.workerId = WORKER_ID;

            job.visibilityTimeout =
                Date.now() + 30000;

            job.processedAt = Date.now();

            await redis.hset(
                REDIS_KEYS.JOB_DATA,
                job.id,
                JSON.stringify(job)
            );

            await redis.hset(
                REDIS_KEYS.ACTIVE_JOBS,
                job.id,
                JSON.stringify(job)
            );
            
            await redis.hset(
                REDIS_KEYS.WORKER_JOBS,
                WORKER_ID,
                job.id
            );

            // Find processor
            const processor =
                processorMap[job.type];

            if (!processor) {

                throw new Error(
                    `No processor for ${job.type}`
                );
            }

            // Execute job
            await processor(job);

            // SUCCESS
            job.status = JOB_STATUS.COMPLETED;

            job.completedAt = Date.now();

            await redis.hset(
                REDIS_KEYS.JOB_DATA,
                job.id,
                JSON.stringify(job)
            );

            await redis.hdel(
                REDIS_KEYS.ACTIVE_JOBS,
                job.id
            );
            
            await redis.hdel(
                REDIS_KEYS.WORKER_JOBS,
                WORKER_ID
            );

            await redis.lpush(
                REDIS_KEYS.COMPLETED,
                job.id
            );

            console.log(
                `Job Completed: ${job.id}`
            );

        } catch (error) {

            console.log(
                "Worker Error:",
                error
            );

            if (job) {

                await retryJob(job, error);
            }
        }
    }
};