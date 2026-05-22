import express from "express";

import {
    getSystemStats,
    getJobs,
    getWorkers
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getSystemStats);

router.get("/jobs", getJobs);

router.get("/workers", getWorkers);

export default router;