import dotenv from "dotenv";

dotenv.config({
    path: "../../.env"
});
import { startHeartbeat, stopHeartbeat } from "./services/heartbeatService.js";
import { startWorker }
    from "./services/workerService.js";
import { requestWorkerStop } from "./services/workerService.js";
import { waitForWorkerDrain } from "./services/workerService.js";
import { publishEvent } from "./services/eventPublisher.js";
import { EVENT_CHANNELS } from "../../../packages/shared/src/constants/eventChannels.js";
import { WORKER_ID } from "./utils/workerIdentity.js";

let heartbeatInterval = null;
let shuttingDown = false;

const publishLifecycle = async (status) => {

    await publishEvent(
        EVENT_CHANNELS.WORKER_LIFECYCLE,
        {
            workerId: WORKER_ID,
            status,
            source: "worker",
            timestamp: Date.now(),
        }
    );
};

const shutdown = async () => {

    if (shuttingDown) {

        return;
    }

    shuttingDown = true;

    requestWorkerStop();

    await publishLifecycle("STOPPING");

    await waitForWorkerDrain();

    await stopHeartbeat(heartbeatInterval);

    await publishLifecycle("STOPPED");

    process.exit(0);
};

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);

heartbeatInterval = await startHeartbeat();

await publishLifecycle("ONLINE");

await startWorker();

await shutdown();
