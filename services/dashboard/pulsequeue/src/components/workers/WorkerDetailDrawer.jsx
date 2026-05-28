import { Box, Divider, Drawer, Grid, Stack, Typography, alpha } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";
import CapabilityPills from "../ai/CapabilityPills";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const ACCENTS = {
    type: "#00C8FF",
    health: { alive: "#00E5A0", dead: "#FF4D6A" },
    uptime: "#7B8CDE",
    jobs: "#FFB800",
    done: "#00E5A0",
    latency: "#FF4D6A",
    model: "#00E5A0",
    queue: "#7B8CDE",
    latencyBadge: "#FFB800",
};

const fmtDuration = (ms = 0) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const Metric = ({ label, value, accent = "#00C8FF" }) => (
    <Box sx={{
        p: 1.5,
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.07)",
        background: alpha(accent, 0.05),
    }}>
        <Typography sx={{
            fontFamily: MONO, fontSize: 9,
            color: "rgba(255,255,255,0.34)",
            letterSpacing: "1.5px", textTransform: "uppercase", mb: 0.8,
        }}>
            {label}
        </Typography>
        <Typography sx={{ fontFamily: MONO, fontSize: 15, color: accent, overflowWrap: "anywhere" }}>
            {value}
        </Typography>
    </Box>
);

const InfoRow = ({ label, value, accent = "rgba(255,255,255,0.85)" }) => (
    <Box sx={{
        p: 1.5, borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.025)",
    }}>
        <Typography sx={{
            fontFamily: MONO, fontSize: 9,
            color: "rgba(255,255,255,0.34)",
            letterSpacing: "1.5px", textTransform: "uppercase", mb: 0.7,
        }}>
            {label}
        </Typography>
        <Typography sx={{ fontFamily: MONO, fontSize: 13, color: accent, overflowWrap: "anywhere" }}>
            {value}
        </Typography>
    </Box>
);

const SectionLabel = ({ children }) => (
    <Typography sx={{
        fontFamily: MONO, fontSize: 9,
        color: "rgba(255,255,255,0.34)",
        letterSpacing: "1.6px", textTransform: "uppercase", mb: 1,
    }}>
        {children}
    </Typography>
);

export default function WorkerDetailDrawer({ worker, open, onClose }) {
    const lastJob = worker?.lastCompletedJob;
    const isAlive = worker?.isAlive;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: "100%", sm: 520 },
                        background: "#080B10",
                        borderLeft: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(18px)",
                        color: "#fff",
                    },
                }
            }}
        >
            {worker && (
                <Box sx={{ p: 3 }}>

                    {/* Header */}
                    <Stack sx={{ mb: 3, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                            <Typography sx={{ fontFamily: SYNE, fontSize: 22, fontWeight: 800, mb: 0.8 }}>
                                AI Worker Node
                            </Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "#00C8FF", overflowWrap: "anywhere" }}>
                                {worker.workerId}
                            </Typography>
                        </Box>
                        <Box
                            component="button"
                            onClick={onClose}
                            sx={{
                                width: 34, height: 34, borderRadius: "8px",
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.04)",
                                color: "rgba(255,255,255,0.6)",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                "&:hover": { background: "rgba(255,255,255,0.09)" },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 18 }} />
                        </Box>
                    </Stack>

                    {/* Status badge */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{
                            display: "inline-flex", alignItems: "center", gap: 0.8,
                            px: 1.5, py: 0.6, borderRadius: "20px",
                            background: alpha(isAlive ? "#00E5A0" : "#FF4D6A", 0.10),
                            border: `1px solid ${alpha(isAlive ? "#00E5A0" : "#FF4D6A", 0.25)}`,
                        }}>
                            <CircleIcon sx={{ fontSize: 8, color: isAlive ? "#00E5A0" : "#FF4D6A" }} />
                            <Typography sx={{
                                fontFamily: MONO, fontSize: 10, fontWeight: 700,
                                letterSpacing: "1.2px", textTransform: "uppercase",
                                color: isAlive ? "#00E5A0" : "#FF4D6A",
                            }}>
                                {worker.healthStatus}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Metric grid */}
                    <Grid container spacing={1.2} sx={{ mb: 3 }}>
                        <Grid item xs={6}><Metric label="Type" value={worker.type} accent={ACCENTS.type} /></Grid>
                        <Grid item xs={6}><Metric label="Uptime" value={fmtDuration(worker.uptime)} accent={ACCENTS.uptime} /></Grid>
                        <Grid item xs={6}><Metric label="Active Executions" value={worker.activeJobs ?? 0} accent={ACCENTS.jobs} /></Grid>
                        <Grid item xs={6}><Metric label="Executions Done" value={(worker.jobsProcessed ?? 0).toLocaleString()} accent={ACCENTS.done} /></Grid>
                        <Grid item xs={6}><Metric label="Avg Latency" value={`${worker.averageExecutionLatency ?? 0}ms`} accent={ACCENTS.latency} /></Grid>
                    </Grid>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mb: 2.5 }} />

                    <Stack sx={{ gap: 1.5 }}>
                        {/* Capabilities */}
                        <Box>
                            <SectionLabel>Capabilities</SectionLabel>
                            <CapabilityPills capabilities={worker.capabilities || []} />
                        </Box>

                        <InfoRow label="Current Execution" value={worker.currentJob || "Idle"} />
                        <InfoRow label="Loaded AI Model" value={worker.loadedModel || "unloaded"} accent={ACCENTS.model} />
                        <InfoRow label="Queue Affinity" value={(worker.queueAffinity || []).join(", ") || "Any"} accent={ACCENTS.queue} />

                        {/* Last completed execution */}
                        <Box>
                            <SectionLabel>Last Completed Execution</SectionLabel>
                            {lastJob ? (
                                <Box sx={{
                                    p: 1.8, borderRadius: "10px",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    background: "rgba(255,255,255,0.025)",
                                }}>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 12, color: "#fff", mb: 0.8 }}>
                                        {lastJob.type}&nbsp;/&nbsp;
                                        <Box component="span" sx={{ color: "rgba(255,255,255,0.45)" }}>{lastJob.jobId}</Box>
                                    </Typography>
                                    <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.38)" }}>
                                        {new Date(lastJob.completedAt).toLocaleString()}
                                        &nbsp;·&nbsp;
                                        <Box component="span" sx={{ color: ACCENTS.latencyBadge }}>{lastJob.executionLatency}ms</Box>
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.24)" }}>
                                    No completed execution recorded.
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Box>
            )}
        </Drawer>
    );
}
