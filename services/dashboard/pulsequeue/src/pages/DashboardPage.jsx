import { useCallback, useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import PsychologyIcon from "@mui/icons-material/Psychology";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HubIcon from "@mui/icons-material/Hub";
import TokenIcon from "@mui/icons-material/Token";
import PercentIcon from "@mui/icons-material/Percent";
import { fetchStats } from "../api/dashboardApi";
import socket from "../hooks/useSocket";
import AiMetricTile from "../components/metrics/AiMetricTile";
import AiActivityFeed from "../components/telemetry/AiActivityFeed";
import AiExecutionCharts from "../components/telemetry/AiExecutionCharts";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const SectionLabel = ({ children }) => (
    <Typography sx={{
        fontFamily: MONO, fontSize: 9, letterSpacing: "1.6px",
        textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
        mb: 1.2, pb: 1, borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
        {children}
    </Typography>
);

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);

    const loadStats = useCallback(async () => {
        const data = await fetchStats();
        setStats(data);
    }, []);

    useEffect(() => {
        queueMicrotask(loadStats);
        const interval = setInterval(loadStats, 10000);
        const refresh = () => loadStats();
        const addActivity = (event) => {
            setEvents((prev) => [event, ...prev].slice(0, 120));
            refresh();
        };
        socket.on("ai_activity", addActivity);
        socket.on("job_created", refresh);
        socket.on("worker_updated", refresh);
        return () => {
            clearInterval(interval);
            socket.off("ai_activity", addActivity);
            socket.off("job_created", refresh);
            socket.off("worker_updated", refresh);
        };
    }, [loadStats]);

    const ai = stats?.ai || {};

    return (
        <Box sx={{ minHeight: "100vh", background: "#080B10", p: 3 }}>

            {/* Page header */}
            <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.34)", letterSpacing: "1.8px", textTransform: "uppercase", mb: 0.8 }}>
                Distributed inference runtime and realtime telemetry
            </Typography>
            <Typography sx={{ fontFamily: SYNE, fontSize: 20, fontWeight: 800, color: "#fff", mb: 3 }}>
                AI Execution Control Plane
            </Typography>

            {/* Metric tiles — locked to 4 columns, fixed height */}
            <SectionLabel>Runtime metrics</SectionLabel>
            <Grid container spacing={1.25} sx={{ mb: 2 }}>
                {[
                    { label: "AI exec/sec", value: ai.aiJobsPerSecond ?? 0, unit: "completed executions / sec", accent: "#00C8FF", icon: <BoltIcon sx={{ fontSize: 22 }} /> },
                    { label: "Inference latency", value: `${ai.inferenceLatency ?? 0}ms`, unit: "avg completed execution", accent: "#FF4D6A", icon: <PsychologyIcon sx={{ fontSize: 22 }} /> },
                    { label: "OCR throughput", value: ai.ocrThroughput ?? 0, unit: "OCR completions / min", accent: "#00E5A0", icon: <VisibilityIcon sx={{ fontSize: 22 }} /> },
                    { label: "Active workers", value: ai.activeAiWorkers ?? 0, unit: "healthy AI worker nodes", accent: "#7B8CDE", icon: <HubIcon sx={{ fontSize: 22 }} /> },
                    { label: "Embeddings", value: ai.embeddingsGenerated ?? 0, unit: "vectors generated", accent: "#00E5A0", icon: <TokenIcon sx={{ fontSize: 22 }} /> },
                    { label: "Token throughput", value: ai.tokenThroughput ?? 0, unit: "text tokens / min", accent: "#FFB800", icon: <TokenIcon sx={{ fontSize: 22 }} /> },
                    { label: "Backlog pressure", value: `${ai.queueSaturation ?? 0}%`, unit: "waiting inference pressure", accent: "#00C8FF", icon: <PercentIcon sx={{ fontSize: 22 }} /> },
                    { label: "Success rate", value: `${ai.jobSuccessRate ?? 100}%`, unit: "completed vs failed", accent: "#00E5A0", icon: <PercentIcon sx={{ fontSize: 22 }} /> },
                ].map((tile) => (
                    <Grid item xs={12} sm={6} lg={3} key={tile.label}>
                        <AiMetricTile {...tile} />
                    </Grid>
                ))}
            </Grid>

            {/* Bottom row — charts + feed */}
            <SectionLabel sx={{ mt: 2 }}>Execution telemetry</SectionLabel>
            <Grid spacing={1.25}>
                <Grid item xs={12} xl={5} sx={{ mb: 2 }}>
                    {/* fixed height passed so both chart panels match */}
                    <AiExecutionCharts metrics={ai} height={260} />
                </Grid>
                <Grid item xs={12} xl={2}>
                    <AiActivityFeed events={events} height={260} />
                </Grid>
            </Grid>
        </Box>
    );
}
