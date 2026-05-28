import { metricsStore } from "@pulsequeue/metrics";

export default router;

export const getMetrics = async (req, res) => {
    try {
        const metrics = metricsStore.getMetrics();
        res.json(metrics);
    } catch (error) {
        console.error("Error fetching metrics:", error);
        res.status(500).json({ error: "Failed to fetch metrics" });
    }
}