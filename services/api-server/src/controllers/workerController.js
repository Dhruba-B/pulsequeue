import {
    listWorkerControls,
    startManagedWorker,
    stopAllManagedWorkers,
    stopManagedWorker
} from "../services/workerManager.js";

export const getWorkerControls = async (req, res) => {
    try {
        const workers = await listWorkerControls();

        return res.json({
            success: true,
            data: workers,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to load managed workers",
        });
    }
};

export const startWorker = async (req, res) => {
    try {
        const count = Math.min(
            Number(req.body?.count || 1),
            10
        );

        const workers = await Promise.all(
            Array.from({ length: count }, () => startManagedWorker())
        );

        return res.status(201).json({
            success: true,
            data: count === 1
                ? workers[0]
                : workers,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to start worker",
        });
    }
};

export const stopWorker = async (req, res) => {
    try {
        const worker = await stopManagedWorker(
            req.params.workerId
        );

        return res.json({
            success: true,
            data: worker,
        });
    } catch (error) {
        console.log(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to stop worker",
        });
    }
};

export const stopWorkers = async (req, res) => {
    try {
        const workers = await stopAllManagedWorkers();

        return res.json({
            success: true,
            data: workers,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to stop workers",
        });
    }
};
