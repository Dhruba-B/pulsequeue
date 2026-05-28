import {
    JOB_PRIORITY,
    JOB_STATUS
} from "../constants/jobConstants.js";

export const createJobObject = ({
    type,
    payload,
    priority = JOB_PRIORITY.MEDIUM,
    runAt = null,
    maxAttempts = 3,
    execution = {}
}) => {
    return {
        id: crypto.randomUUID(),

        type,

        payload,

        execution,

        status: runAt
            ? JOB_STATUS.DELAYED
            : JOB_STATUS.WAITING,

        priority,

        attempts: 0,

        maxAttempts,

        createdAt: Date.now(),

        timeline: [
            {
                status: runAt
                    ? JOB_STATUS.DELAYED
                    : JOB_STATUS.WAITING,
                label: runAt ? "Scheduled for execution" : "Queued for execution",
                timestamp: Date.now(),
                capability: execution.preferredCapability || type,
            }
        ],

        processedAt: null,

        completedAt: null,

        failedReason: null,

        workerId: null,

        runAt
    };
};
