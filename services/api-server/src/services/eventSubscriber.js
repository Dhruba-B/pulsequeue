import { subscriber } from "../../../../packages/redis-client/src/pubsub.js";

import { EVENT_CHANNELS } from "../../../../packages/shared/src/constants/eventChannels.js";

import { io } from "../index.js";

export const startEventSubscriber = async () => {
    await subscriber.subscribe(
        EVENT_CHANNELS.JOB_COMPLETED,

        EVENT_CHANNELS.JOB_FAILED,

        EVENT_CHANNELS.WORKER_UPDATED,

        EVENT_CHANNELS.WORKER_LIFECYCLE,
    );

    console.log("Subscribed to events");

    subscriber.on("message", (channel, message) => {
        const payload = JSON.parse(message);

        console.log("Event Received:", channel);

        switch (channel) {
            case EVENT_CHANNELS.JOB_COMPLETED:
                io.emit("job_completed", payload);

                break;

            case EVENT_CHANNELS.JOB_FAILED:
                io.emit("job_failed", payload);

                break;

            case EVENT_CHANNELS.WORKER_UPDATED:
                io.emit("worker_updated", payload);

                break;

            case EVENT_CHANNELS.WORKER_LIFECYCLE:
                io.emit("worker_lifecycle", payload);

                io.emit(
                    "worker_updated",
                    {
                        ...payload,
                        status:
                            payload.status === "ONLINE"
                            ||
                            payload.status === "STARTED"
                                ? "RUNNING"
                                : payload.status,
                    }
                );

                break;
        }
    });
};
