import { startHeartbeat } from "./services/heartbeatService.js";
import { startWorker }
    from "./services/workerService.js";


startHeartbeat();


startWorker();