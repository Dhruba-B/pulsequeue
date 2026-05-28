import { Box, LinearProgress, Paper, Stack, Tooltip, Typography, alpha } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import MemoryIcon from "@mui/icons-material/Memory";
import BoltIcon from "@mui/icons-material/Bolt";
import CapabilityPills from "../ai/CapabilityPills";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const fmtDuration = (ms = 0) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const StatCell = ({ label, value, accent = "rgba(255,255,255,0.72)" }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "1.4px", textTransform: "uppercase", mb: 0.6 }}>
            {label}
        </Typography>
        <Typography noWrap sx={{ fontFamily: MONO, fontSize: 12, color: accent }}>
            {value}
        </Typography>
    </Box>
);

export default function WorkerCard({ worker, onClick }) {
    const accent = worker.isAlive ? "#00E5A0" : "#FF4D6A";
    const utilization = worker.currentJob ? 100 : 0;

    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                position: "relative",
                overflow: "hidden",
                p: 2,
                minHeight: 410,
                borderRadius: "18px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                cursor: "pointer",
                transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                width: 350,
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: alpha(accent, 0.38),
                    boxShadow: `0 16px 44px ${alpha(accent, 0.1)}`,
                },
            }}
        >
            <Box sx={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 90% 0%, ${alpha(accent, 0.13)}, transparent 38%)`, pointerEvents: "none" }} />
            <Box sx={{ position: "relative" }}>
                <Stack sx={{ mb: 2, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Stack sx={{ mb: 1, flexDirection: "row", gap: 1, alignItems: "center" }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 14px ${alpha(accent, 0.72)}` }} />
                            <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1.6px", color: accent }}>
                                {worker.healthStatus || worker.status}
                            </Typography>
                        </Stack>
                        <Typography sx={{ fontFamily: SYNE, fontSize: 18, fontWeight: 800, color: "#fff", mb: 0.8, textAlign: "left"}}>
                            {worker.type || "GENERAL"} Node
                        </Typography>
                        <Tooltip title={worker.workerId}>
                            <Typography noWrap sx={{ maxWidth: 260, fontFamily: MONO, fontSize: 11, color: "#00C8FF" }}>
                                {worker.workerId}
                            </Typography>
                        </Tooltip>
                    </Box>
                    <Box sx={{ px: 1, py: 0.5, borderRadius: "8px", border: `1px solid ${alpha(accent, 0.24)}`, background: alpha(accent, 0.08), fontFamily: MONO, fontSize: 10, color: accent }}>
                        {worker.status || "OFFLINE"}
                    </Box>
                </Stack>

                <CapabilityPills capabilities={worker.capabilities || []} />

                <Box sx={{ mt: 2, p: 1.3, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.16)" }}>
                    <Stack sx={{ mb: 1, flexDirection: "row", gap: 1, alignItems: "center" }}>
                        <WorkOutlineIcon sx={{ fontSize: 15, color: worker.currentJob ? "#00C8FF" : "rgba(255,255,255,0.24)" }} />
                        <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.34)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                            Current execution
                        </Typography>
                    </Stack>
                    <Typography noWrap sx={{ fontFamily: MONO, fontSize: 12, color: worker.currentJob ? "#00C8FF" : "rgba(255,255,255,0.58)" }}>
                        {worker.currentJob || "Idle"}
                    </Typography>
                </Box>

                <Stack sx={{ mt: 2, gap: 1.3 }}>
                    <Box>
                        <Stack sx={{ mb: 0.7, flexDirection: "row", justifyContent: "space-between" }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.32)" }}>Worker utilization</Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#FFB800" }}>{utilization}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={utilization} sx={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", "& .MuiLinearProgress-bar": { background: "#FFB800", boxShadow: `0 0 12px ${alpha("#FFB800", 0.55)}` } }} />
                    </Box>
                    <Stack sx={{ flexDirection: "row", gap: 1, justifyContent: "space-between" }}>
                        <StatCell label="Uptime" value={fmtDuration(worker.uptime)} accent="#7B8CDE" />
                        <StatCell label="Executions" value={worker.jobsProcessed || 0} accent="#00E5A0" />
                        <StatCell label="Avg Latency" value={`${worker.averageExecutionLatency || 0}ms`} accent="#FF4D6A" />
                    </Stack>
                </Stack>

                <Stack sx={{ mt: 2, flexDirection: "row", gap: 1 }}>
                    {/* <BoltIcon sx={{ fontSize: 14, color: "#FFB800" }} /> */}
                    <MemoryIcon sx={{ fontSize: 14, color: "#7B8CDE" }} />
                    <Typography noWrap sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.34)", textWrap: "wrap" }}>
                        {worker.loadedModel || "unloaded"}
                    </Typography>
                </Stack>
            </Box>
        </Paper>
    );
}
