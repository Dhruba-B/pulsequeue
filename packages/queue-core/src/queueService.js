import redis from "../../redis-client/src/index.js";

import { REDIS_KEYS } from "../../shared/src/constants/redisKeys.js";

import {
    JOB_PRIORITY
} from "../../shared/src/constants/jobConstants.js";

export const addJobToQueue = async (job) => {

    // Store full job data
    await redis.hset(
        REDIS_KEYS.JOB_DATA,
        job.id,
        JSON.stringify(job)
    );

    // Delayed job
    if (job.runAt) {

        await redis.zadd(
            REDIS_KEYS.DELAYED,
            job.runAt,
            job.id
        );

        return job;
    }

    // Push into priority queue
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

    return job;
};