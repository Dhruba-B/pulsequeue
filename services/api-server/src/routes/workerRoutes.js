import express from "express";

import {
    getWorkerControls,
    startWorker,
    stopWorker,
    stopWorkers
} from "../controllers/workerController.js";

const router = express.Router();

router.get("/", getWorkerControls);

router.post("/start", startWorker);

router.post("/stop", stopWorkers);

router.post("/:workerId/stop", stopWorker);

export default router;
