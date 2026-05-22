import { io } from "../index.js";

export const emitJobCreated = (job) => {
  io.emit("job_created", job);
};

export const emitJobCompleted = (job) => {
  io.emit("job_completed", job);
};

export const emitJobFailed = (job) => {
  io.emit("job_failed", job);
};

export const emitWorkerUpdated = (worker) => {
  io.emit("worker_updated", worker);
};
