import { publisher } from "../../../../packages/redis-client/src/pubsub.js";

export const publishEvent = async (channel, payload) => {
    await publisher.publish(channel, JSON.stringify(payload));
};
