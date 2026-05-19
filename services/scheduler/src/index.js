import { startRecoveryScanner } from "../../worker/src/services/recoveryScanner.js";
import { startDelayedScheduler }
    from "./services/dealyedJobScheduler.js";

startDelayedScheduler();

startRecoveryScanner();