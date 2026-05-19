import redis
    from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS }
    from "../../../../packages/shared/src/constants/redisKeys.js";

import { WORKER_ID }
    from "../utils/workerIdentity.js";

export const startHeartbeat = async () => {

    setInterval(async () => {

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

    }, 5000);
};