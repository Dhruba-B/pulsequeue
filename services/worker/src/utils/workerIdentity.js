import { v4 as uuidv4 } from "uuid";

export const WORKER_ID =
    process.env.PULSEQUEUE_WORKER_ID
    ||
    `worker-${uuidv4()}`;
