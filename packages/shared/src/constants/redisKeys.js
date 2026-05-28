export const REDIS_KEYS = {

    JOB_DATA: "jobs:data",

    WAITING_HIGH: "queue:waiting:high",

    WAITING_MEDIUM: "queue:waiting:medium",

    WAITING_LOW: "queue:waiting:low",

    ACTIVE: "queue:active",

    COMPLETED: "queue:completed",

    FAILED: "queue:failed",

    DELAYED: "queue:delayed",

    WORKERS: "workers",

    ACTIVE_JOBS: "queue:active:jobs",

    WORKER_HEARTBEATS: "workers:heartbeats",

    WORKER_JOBS: "workers:jobs",

    MANAGED_WORKERS: "workers:managed",

    WORKER_LIFECYCLE_EVENTS: "workers:lifecycle:events",

    WORKER_CAPABILITIES: "pulsequeue:worker:capabilities",

    WORKER_METRICS: "pulsequeue:worker:metrics",
};
