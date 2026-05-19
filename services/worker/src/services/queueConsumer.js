import redis
    from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";

export const getNextJob = async () => {

    // HIGH PRIORITY
    let jobId = await redis.rpop(
        REDIS_KEYS.WAITING_HIGH
    );

    if (jobId) {
        return jobId;
    }

    // MEDIUM PRIORITY
    jobId = await redis.rpop(
        REDIS_KEYS.WAITING_MEDIUM
    );

    if (jobId) {
        return jobId;
    }

    // LOW PRIORITY
    jobId = await redis.rpop(
        REDIS_KEYS.WAITING_LOW
    );

    return jobId;
};