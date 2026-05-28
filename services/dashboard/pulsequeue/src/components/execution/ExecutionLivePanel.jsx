import { Box, Paper, Stack, Typography, alpha } from "@mui/material";
import { Activity, CheckCircle2, Cpu, LoaderCircle, RadioTower, TriangleAlert } from "lucide-react";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const EVENT_META = {
    JOB_CREATED: { label: "Queued", color: "#FFB800", icon: RadioTower },
    JOB_STARTED: { label: "Worker picked", color: "#00C8FF", icon: Cpu },
    INFERENCE_STARTED: { label: "Inference", color: "#7B8CDE", icon: LoaderCircle },
    JOB_COMPLETED: { label: "Completed", color: "#00E5A0", icon: CheckCircle2 },
    JOB_FAILED: { label: "Failed", color: "#FF4D6A", icon: TriangleAlert },
};

const eventForJob = (event, executionId) => {
    const payload = event.payload || {};
    return payload.id === executionId || payload.jobId === executionId || event.jobId === executionId;
};

const fmtTime = (timestamp) => timestamp
    ? new Date(Number(timestamp)).toLocaleTimeString("en-US", { hour12: false })
    : "--:--:--";

export default function ExecutionLivePanel({
    executionId,
    events,
}) {
    const scopedEvents = executionId
        ? events.filter((event) => eventForJob(event, executionId))
        : [];

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: "16px",
                background: "rgba(255,255,255,0.028)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                overflow: "hidden",
                minHeight: 230,
            }}
        >
            <Stack sx={{ px: 2, py: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Box>
                    <Typography sx={{ fontFamily: SYNE, fontSize: 15, fontWeight: 800, color: "#fff" }}>
                        Realtime Execution Trace
                    </Typography>
                    <Typography sx={{ mt: 0.4, fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "1.2px", textTransform: "uppercase" }}>
                        {executionId ? executionId : "submit an execution to attach live events"}
                    </Typography>
                </Box>
                <Stack sx={{ flexDirection: "row", gap: 0.7, alignItems: "center", color: "#00E5A0" }}>
                    <Activity size={14} />
                    <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1.2px" }}>LIVE</Typography>
                </Stack>
            </Stack>

            <Box sx={{ p: 2 }}>
                {scopedEvents.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.24)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                            Waiting for queue state, worker pickup, inference, completion, or retry events
                        </Typography>
                    </Box>
                ) : (
                    <Stack sx={{ gap: 1 }}>
                        {scopedEvents.map((event, index) => {
                            const meta = EVENT_META[event.type] || EVENT_META.INFERENCE_STARTED;
                            const Icon = meta.icon;

                            return (
                                <Box
                                    key={`${event.type}-${event.timestamp}-${index}`}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "34px 1fr auto",
                                        gap: 1.2,
                                        alignItems: "center",
                                        p: 1.1,
                                        borderRadius: "12px",
                                        background: alpha(meta.color, 0.055),
                                        border: `1px solid ${alpha(meta.color, 0.18)}`,
                                    }}
                                >
                                    <Box sx={{ width: 30, height: 30, borderRadius: "10px", display: "grid", placeItems: "center", color: meta.color, background: alpha(meta.color, 0.1) }}>
                                        <Icon size={15} />
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "#fff" }}>
                                            {meta.label}
                                        </Typography>
                                        <Typography noWrap sx={{ mt: 0.2, fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.34)" }}>
                                            {event.message || event.payload?.workerId || "control-plane"}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 10, color: meta.color }}>
                                        {fmtTime(event.timestamp)}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Paper>
    );
}
