import redis from "../../../../packages/redis-client/src/index.js";

import { REDIS_KEYS } from "../../../../packages/shared/src/constants/redisKeys.js";

import { WORKER_CAPABILITIES_LIST } from "../config/workerCapabilities.js";

const PRIORITY_QUEUES = [
    REDIS_KEYS.WAITING_HIGH,

    REDIS_KEYS.WAITING_MEDIUM,

    REDIS_KEYS.WAITING_LOW,
];

const findCompatibleJob = async (queueKey) => {
    const jobIds = await redis.lrange(
        queueKey, 0, -1,
    );

    for (const jobId of jobIds) {
        const raw = await redis.hget(
            REDIS_KEYS.JOB_DATA,

            jobId,
        );

        if (!raw) {
            continue;
        }

        const job = JSON.parse(raw);

        const compatible = WORKER_CAPABILITIES_LIST.includes(job.type);

        if (!compatible) {
            continue;
        }

        // CLAIM JOB

        await redis.lrem(
            queueKey,

            1,

            jobId,
        );

        return jobId;
    }

    return null;
};

export const getNextJob = async () => {
    for (const queueKey of PRIORITY_QUEUES) {
        const jobId = await findCompatibleJob(queueKey);

        if (jobId) {
            return jobId;
        }
    }

    return null;
};
