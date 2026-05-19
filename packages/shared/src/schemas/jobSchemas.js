import {
    JOB_PRIORITY,
    JOB_STATUS
} from "../constants/jobConstants.js";

export const createJobObject = ({
    type,
    payload,
    priority = JOB_PRIORITY.MEDIUM,
    runAt = null,
    maxAttempts = 3
}) => {
    return {
        id: crypto.randomUUID(),

        type,

        payload,

        status: runAt
            ? JOB_STATUS.DELAYED
            : JOB_STATUS.WAITING,

        priority,

        attempts: 0,

        maxAttempts,

        createdAt: Date.now(),

        processedAt: null,

        completedAt: null,

        failedReason: null,

        workerId: null,

        runAt
    };
};