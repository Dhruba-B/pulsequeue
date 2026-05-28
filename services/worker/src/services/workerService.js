import redis from "../../../../packages/redis-client/src/index.js";

import { getNextJob } from "./queueConsumer.js";

import { processorMap } from "../processors/index.js";

import { retryJob } from "./retryService.js";

import { JOB_STATUS } from "../../../../packages/shared/src/constants/jobConstants.js";

import { REDIS_KEYS } from "../../../../packages/shared/src/constants/redisKeys.js";
import { WORKER_ID } from "../utils/workerIdentity.js";

import { publishEvent } from "./eventPublisher.js";

import { EVENT_CHANNELS } from "../../../../packages/shared/src/constants/eventChannels.js";

import { sleep } from "../utils/sleep.js";
import { AI_EXECUTORS } from "../../../../packages/ai-core/src/executors/index.js";
import { WORKER_CAPABILITIES_LIST, WORKER_TYPE } from "../config/workerCapabilities.js";

let isRunning = true;

let activeJobs = 0;

let jobsProcessed = 0;

let totalExecutionLatency = 0;

let lastCompletedJob = null;

const MODEL_BY_CAPABILITY = {
    SUMMARIZE: "ollama/local-llm",
    TRANSLATE: "ollama/local-llm",
    CLASSIFY: "rules/classifier-v1",
    OCR: "tesseract/eng",
    EMBED: "Xenova/all-MiniLM-L6-v2",
};

const getLoadedModel = () => (
    WORKER_CAPABILITIES_LIST
        .map((capability) => MODEL_BY_CAPABILITY[capability])
        .filter(Boolean)
        .join(", ")
);

const appendTimeline = (job, status, label, extra = {}) => ({
    ...job,
    timeline: [
        ...(job.timeline || []),
        {
            status,
            label,
            timestamp: Date.now(),
            ...extra,
        },
    ],
});

const updateWorkerMetrics = async (extra = {}) => {
    await redis.hset(
        REDIS_KEYS.WORKER_METRICS,
        WORKER_ID,
        JSON.stringify({
            workerId: WORKER_ID,
            type: WORKER_TYPE,
            capabilities: WORKER_CAPABILITIES_LIST,
            activeJobs,
            jobsProcessed,
            averageExecutionLatency:
                jobsProcessed > 0
                    ? Math.round(totalExecutionLatency / jobsProcessed)
                    : 0,
            loadedModel: getLoadedModel(),
            lastCompletedJob,
            queueAffinity: WORKER_CAPABILITIES_LIST,
            updatedAt: Date.now(),
            healthStatus: activeJobs > 0 ? "EXECUTING" : "HEALTHY",
            ...extra,
        }),
    );
};

export const requestWorkerStop = () => {
    isRunning = false;
};

export const waitForWorkerDrain = async () => {
    while (activeJobs > 0) {
        await sleep(250);
    }
};

export const startWorker = async () => {
    console.log("Worker Started");

    await redis.hset(
        REDIS_KEYS.WORKER_CAPABILITIES,

        WORKER_ID,

        JSON.stringify(WORKER_CAPABILITIES_LIST),
    );

    await redis.hset(
        REDIS_KEYS.WORKERS,

        WORKER_ID,

        JSON.stringify({
            workerId: WORKER_ID,

            type: WORKER_TYPE,

            capabilities: WORKER_CAPABILITIES_LIST,

            startedAt: Date.now(),

            loadedModel: getLoadedModel(),

            queueAffinity: WORKER_CAPABILITIES_LIST,
        }),
    );

    await updateWorkerMetrics({
        healthStatus: "HEALTHY",
    });



    while (isRunning) {
        let job = null;
        const startTime = Date.now();
        try {
            const jobId = await getNextJob();

            // No jobs available
            if (!jobId) {
                await sleep(1000);

                continue;
            }

            console.log("Picked Job:", jobId);

            activeJobs += 1;

            // Fetch job data
            const jobData = await redis.hget(REDIS_KEYS.JOB_DATA, jobId);

            if (!jobData) {
                console.log("Job data missing");

                activeJobs -= 1;

                continue;
            }

            job = JSON.parse(jobData);

            // Mark ACTIVE
            job = appendTimeline(
                job,
                JOB_STATUS.ACTIVE,
                "Picked by worker",
                {
                    workerId: WORKER_ID,
                },
            );

            job.status = JOB_STATUS.ACTIVE;

            job.workerId = WORKER_ID;

            job.visibilityTimeout = Date.now() + 30000;

            job.processedAt = Date.now();

            job = appendTimeline(
                job,
                JOB_STATUS.ACTIVE,
                "Started execution",
                {
                    workerId: WORKER_ID,
                },
            );

            await redis.hset(REDIS_KEYS.JOB_DATA, job.id, JSON.stringify(job));

            await redis.hset(REDIS_KEYS.ACTIVE_JOBS, job.id, JSON.stringify(job));

            await redis.hset(REDIS_KEYS.WORKER_JOBS, WORKER_ID, job.id);

            await updateWorkerMetrics({
                currentJob: job.id,
                healthStatus: "EXECUTING",
            });

            await publishEvent(EVENT_CHANNELS.JOB_STARTED, {
                jobId: job.id,
                type: job.type,
                workerId: WORKER_ID,
                timestamp: Date.now(),
            });

            // Find processor
            const processor = processorMap[job.type];

            const executor = AI_EXECUTORS[job.type];

            if (!executor && !processor) {
                throw new Error(`Unsupported job: ${job.type}`);
            }

            // Execute job

            let result = null;
            if (processor) result = await processor(job);
            else if (executor) result = await executor(job);

            // SUCCESS
            const executionLatency = Date.now() - startTime;

            job.status = JOB_STATUS.COMPLETED;
            job.result = result;
            job.completedAt = Date.now();
            job.executionLatency = executionLatency;

            job = appendTimeline(
                job,
                JOB_STATUS.COMPLETED,
                "Completed",
                {
                    workerId: WORKER_ID,
                    duration: executionLatency,
                },
            );

            await redis.hset(REDIS_KEYS.JOB_DATA, job.id, JSON.stringify(job));

            await redis.hdel(REDIS_KEYS.ACTIVE_JOBS, job.id);

            await redis.hdel(REDIS_KEYS.WORKER_JOBS, WORKER_ID);

            await redis.lpush(REDIS_KEYS.COMPLETED, job.id);

            jobsProcessed += 1;

            totalExecutionLatency += executionLatency;

            lastCompletedJob = {
                jobId: job.id,
                type: job.type,
                completedAt: job.completedAt,
                executionLatency,
            };

            await updateWorkerMetrics({
                currentJob: null,
                healthStatus: "HEALTHY",
            });

            await publishEvent(EVENT_CHANNELS.JOB_COMPLETED, {
                jobId: job.id,
                type: job.type,
                workerId: job.workerId,
                timestamp: Date.now(),
                executionLatency,
            });
            console.log(`Job Completed: ${job.id}`);
        } catch (error) {
            console.log("Worker Error:", error);

            if (job) {
                job = appendTimeline(
                    job,
                    JOB_STATUS.FAILED,
                    job.attempts + 1 >= job.maxAttempts ? "Failed" : "Retry scheduled",
                    {
                        workerId: WORKER_ID,
                        error: error.message,
                    },
                );

                await retryJob(job, error);

                await redis.hdel(REDIS_KEYS.ACTIVE_JOBS, job.id);

                await redis.hdel(REDIS_KEYS.WORKER_JOBS, WORKER_ID);

                await updateWorkerMetrics({
                    currentJob: null,
                    healthStatus: "DEGRADED",
                });
            }
        } finally {
            if (activeJobs > 0) {
                activeJobs -= 1;
            }

            await updateWorkerMetrics({
                activeJobs,
                healthStatus: activeJobs > 0 ? "EXECUTING" : "HEALTHY",
            });
        }
    }
};
