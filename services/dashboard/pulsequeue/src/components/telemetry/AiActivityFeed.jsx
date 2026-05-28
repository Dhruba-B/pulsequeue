import { Box, Paper, Stack, Typography, alpha } from "@mui/material";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const EVENT_META = {
    JOB_CREATED: { label: "Queued", color: "#FFB800" },
    JOB_STARTED: { label: "Picked", color: "#00C8FF" },
    JOB_COMPLETED: { label: "Complete", color: "#00E5A0" },
    JOB_FAILED: { label: "Failed", color: "#FF4D6A" },
    WORKER_ONLINE: { label: "Worker Up", color: "#00E5A0" },
    WORKER_STOPPED: { label: "Worker Dn", color: "#FF4D6A" },
};

const fmtRelative = (timestamp) => {
    const seconds = Math.floor((Date.now() - Number(timestamp || Date.now())) / 1000);
    if (seconds < 60) return `${Math.max(seconds, 0)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return new Date(Number(timestamp)).toLocaleTimeString("en-US", { hour12: false });
};

export default function AiActivityFeed({ events = [] }) {
    return (
        <Paper
            elevation={0}
            sx={{
                height: "100%",
                minHeight: 420,
                borderRadius: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                overflow: "hidden",
                backdropFilter: "blur(16px)",
            }}
        >
            <Stack sx={{ px: 2, py: 1.7, borderBottom: "1px solid rgba(255,255,255,0.07)", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: SYNE, fontSize: 16, fontWeight: 800, color: "#fff" }}>AI Activity</Typography>
                <Stack sx={{ flexDirection: "row", gap: 0.8, alignItems: "center" }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#00E5A0", boxShadow: `0 0 12px ${alpha("#00E5A0", 0.7)}` }} />
                    <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#00E5A0", letterSpacing: "1.5px" }}>LIVE</Typography>
                </Stack>
            </Stack>
            <Box sx={{ maxHeight: 620, overflow: "auto" }}>
                {events.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "1.4px", textTransform: "uppercase" }}>
                            Awaiting execution events
                        </Typography>
                    </Box>
                ) : events.slice(0, 80).map((event, index) => {
                    const meta = EVENT_META[event.type] || { label: event.type, color: "#7B8CDE" };
                    return (
                        <Box key={`${event.timestamp}-${event.type}-${index}`} sx={{ display: "grid", gridTemplateColumns: "92px 1fr 52px", gap: 1.2, px: 2, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.045)", alignItems: "center" }}>
                            <Box sx={{ px: 0.9, py: 0.4, borderRadius: "7px", border: `1px solid ${alpha(meta.color, 0.28)}`, background: alpha(meta.color, 0.08), color: meta.color, fontFamily: MONO, fontSize: 9, fontWeight: 700, textAlign: "center" }}>
                                {meta.label}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.68)" }}>{event.message}</Typography>
                                <Typography noWrap sx={{ mt: 0.25, fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.28)" }}>{event.workerId || event.worker || "control-plane"}</Typography>
                            </Box>
                            <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.28)", textAlign: "right" }}>
                                {fmtRelative(event.timestamp)}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}
