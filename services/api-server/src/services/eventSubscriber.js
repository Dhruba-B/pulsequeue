import { subscriber } from "../../../../packages/redis-client/src/pubsub.js";

import { EVENT_CHANNELS } from "../../../../packages/shared/src/constants/eventChannels.js";

import { io } from "../index.js";

export const startEventSubscriber = async () => {
    await subscriber.subscribe(
        EVENT_CHANNELS.JOB_COMPLETED,

        EVENT_CHANNELS.JOB_FAILED,
    );

    console.log("Subscribed to events");

    subscriber.on("message", (channel, message) => {
        const payload = JSON.parse(message);

        console.log("Event Received:", channel);
        debugger
        switch (channel) {
            case EVENT_CHANNELS.JOB_COMPLETED:
                io.emit("job_completed", payload);

                break;

            case EVENT_CHANNELS.JOB_FAILED:
                io.emit("job_failed", payload);

                break;
        }
    });
};
