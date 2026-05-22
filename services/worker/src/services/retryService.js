import redis
    from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";

import {
    JOB_STATUS
} from "../../../../packages/shared/src/constants/jobConstants.js";
import { publishEvent } from "./eventPublisher.js";
import { EVENT_CHANNELS } from "../../../../packages/shared/src/constants/eventChannels.js";

const BASE_DELAY = 2000;

export const retryJob = async (job, error) => {

    // Increase attempts
    job.attempts += 1;

    // Store failure reason
    job.failedReason = error.message;

    // Max retries exceeded
    if (job.attempts >= job.maxAttempts) {

        job.status = JOB_STATUS.FAILED;

        await redis.hset(
            REDIS_KEYS.JOB_DATA,
            job.id,
            JSON.stringify(job)
        );

        await redis.lpush(
            REDIS_KEYS.FAILED,
            job.id
        );

        await publishEvent(
            EVENT_CHANNELS.JOB_FAILED,
            {
                jobId: job.id,
                error: error.message,
                workerId: job.workerId,
                timestamp: Date.now(),
            },
        );


        console.log(
            `Job permanently failed: ${job.id}`
        );

        return;
    }

    // Retry delay
    const delay =
        BASE_DELAY * Math.pow(2, job.attempts);

    const retryAt = Date.now() + delay;

    // Mark delayed
    job.status = JOB_STATUS.DELAYED;

    job.runAt = retryAt;

    await redis.hset(
        REDIS_KEYS.JOB_DATA,
        job.id,
        JSON.stringify(job)
    );

    // Add to delayed queue
    await redis.zadd(
        REDIS_KEYS.DELAYED,
        retryAt,
        job.id
    );

    console.log(
        `Retrying job ${job.id} in ${delay}ms`
    );
};