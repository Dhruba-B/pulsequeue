import redis
    from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";

import { WORKER_ID }
    from "../utils/workerIdentity.js";

export const startHeartbeat = async () => {

    await redis.hset(
        REDIS_KEYS.WORKER_HEARTBEATS,
        WORKER_ID,
        Date.now()
    );

    const interval = setInterval(async () => {

        try {

            await redis.hset(
                REDIS_KEYS.WORKER_HEARTBEATS,
                WORKER_ID,
                Date.now()
            );

        } catch (error) {

            console.log(
                "Heartbeat Error:",
                error
            );
        }

    }, 60000);

    return interval;
};

export const stopHeartbeat = async (interval) => {

    if (interval) {

        clearInterval(interval);
    }

    await redis.hdel(
        REDIS_KEYS.WORKER_HEARTBEATS,
        WORKER_ID
    );
};
