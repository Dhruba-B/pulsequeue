import { Box, Stack, Typography, alpha } from "@mui/material";

const MONO = "'Space Mono', monospace";

const fmtTime = (timestamp) => timestamp
    ? new Date(Number(timestamp)).toLocaleTimeString("en-US", { hour12: false })
    : "-";

const fmtDuration = (duration) => {
    if (duration == null) return null;
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
};

export default function JobExecutionTimeline({ job }) {
    const timeline = job?.timeline?.length
        ? job.timeline
        : [
            { status: job.status, label: "Queued", timestamp: job.createdAt },
            job.processedAt && { status: "ACTIVE", label: "Started execution", timestamp: job.processedAt, workerId: job.workerId },
            job.completedAt && { status: job.status, label: job.status === "FAILED" ? "Failed" : "Completed", timestamp: job.completedAt, duration: job.executionLatency },
        ].filter(Boolean);

    return (
        <Stack sx={{ gap: 0 }}>
            {timeline.map((event, index) => {
                const color = event.status === "FAILED" ? "#FF4D6A" : event.status === "COMPLETED" ? "#00E5A0" : "#00C8FF";
                return (
                    <Box
                        key={`${event.label}-${event.timestamp}-${index}`}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "28px 1fr auto",
                            gap: 1.5,
                            py: 1.2,
                            position: "relative",
                        }}
                    >
                        <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
                            <Box sx={{ width: 9, height: 9, borderRadius: "50%", mt: "5px", background: color, boxShadow: `0 0 14px ${alpha(color, 0.65)}`, zIndex: 1 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontFamily: MONO, fontSize: 12, color: "#fff" }}>{event.label}</Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)", mt: 0.4 }}>
                                {event.workerId || job.workerId || "scheduler"}
                                {event.error ? ` / ${event.error}` : ""}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.42)" }}>{fmtTime(event.timestamp)}</Typography>
                            {fmtDuration(event.duration) && (
                                <Typography sx={{ fontFamily: MONO, fontSize: 10, color, mt: 0.4 }}>{fmtDuration(event.duration)}</Typography>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Stack>
    );
}
