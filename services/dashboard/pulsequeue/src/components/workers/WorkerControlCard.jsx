import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
    alpha
} from "@mui/material";
import { Power, Square, TerminalSquare } from "lucide-react";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const STATUS_META = {
    STARTING: { color: "#00C8FF", label: "Starting" },
    RUNNING: { color: "#00E5A0", label: "Running" },
    ONLINE: { color: "#00E5A0", label: "Online" },
    STOPPING: { color: "#FFB800", label: "Draining" },
    STOPPED: { color: "rgba(255,255,255,0.36)", label: "Stopped" },
    OFFLINE: { color: "#FF4D6A", label: "Offline" },
    EXITED: { color: "#FF4D6A", label: "Exited" },
    ERROR: { color: "#FF4D6A", label: "Error" },
    ORPHANED: { color: "#7B8CDE", label: "Orphaned" },
};

const isStopping = (status) =>
    status === "STOPPING";

const isRunning = (status) =>
    status === "RUNNING"
    ||
    status === "ONLINE"
    ||
    status === "STARTING";

export default function WorkerControlCard({
    worker,
    pending,
    onStop
}) {
    const meta = STATUS_META[worker.status] || STATUS_META.STOPPED;
    const canStop = Boolean(worker.controllable ?? worker.managed) && isRunning(worker.status) && !pending;
    const busy = pending || isStopping(worker.status) || worker.status === "STARTING";
    const title = worker.managed ? "Managed Worker" : "External Worker";

    return (
        <Paper
            elevation={0}
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.028)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: alpha(meta.color, 0.35),
                    boxShadow: `0 14px 40px ${alpha(meta.color, 0.08)}`,
                },
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
                    opacity: 0.8,
                }}
            />

            <Stack sx={{ p: "20px", gap: 2, justifyContent: "space-between", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" } }}>
                <Stack sx={{ minWidth: 0, alignItems: "center", mr: { xs: 0, md: 2 }, flexDirection: "row", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: alpha(meta.color, 0.1),
                            border: `1px solid ${alpha(meta.color, 0.2)}`,
                            color: meta.color,
                            flexShrink: 0,
                        }}
                    >
                        <TerminalSquare size={18} />
                    </Box>

                    <Box sx={{ minWidth: 0, textAlign: "left" }}>
                        <Typography sx={{ fontFamily: SYNE, fontSize: "16px", fontWeight: 800, color: "#fff", mb: "7px", display: "flex", alignItems: "center", gap: 1 }}>
                            {title}
                            <Box
                                sx={{
                                    px: "10px",
                                    py: "7px",
                                    borderRadius: "10px",
                                    border: `1px solid ${alpha(meta.color, 0.22)}`,
                                    background: alpha(meta.color, 0.08),
                                }}
                            >
                                <Stack sx={{ alignItems: "center", flexDirection: "row", gap: 0.75 }}>
                                    <Box
                                        sx={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            background: meta.color,
                                            boxShadow: `0 0 10px ${meta.color}`,
                                        }}
                                    />
                                    <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "1.4px", color: meta.color, textTransform: "uppercase" }}>
                                        {meta.label}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Typography>

                        <Tooltip title={worker.workerId}>
                            <Typography
                                noWrap
                                sx={{
                                    fontFamily: MONO,
                                    fontSize: "10px",
                                    color: "#00C8FF",
                                    maxWidth: { xs: "220px", sm: "360px" },
                                }}
                            >
                                {worker.workerId}
                            </Typography>
                        </Tooltip>
                    </Box>
                </Stack>

                <Stack sx={{ alignItems: { xs: "stretch", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>


                    <Box
                        sx={{
                            px: "12px",
                            py: "8px",
                            borderRadius: "10px",
                            background: "rgba(0,0,0,0.16)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            minWidth: 96,
                        }}
                    >
                        <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "1.8px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
                            PID
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: "13px", color: "rgba(255,255,255,0.72)" }}>
                            {worker.pid || "none"}
                        </Typography>
                    </Box>

                    <Button
                        disabled={!canStop}
                        onClick={() => onStop(worker.workerId)}
                        startIcon={busy ? <CircularProgress size={14} /> : <Square size={14} />}
                        sx={{
                            minHeight: 38,
                            px: 1.5,
                            borderRadius: "10px",
                            fontFamily: MONO,
                            fontSize: "10px",
                            letterSpacing: "1px",
                            color: canStop ? "#FF4D6A" : "rgba(255,255,255,0.25)",
                            border: "1px solid",
                            borderColor: canStop ? alpha("#FF4D6A", 0.32) : "rgba(255,255,255,0.06)",
                            background: canStop ? alpha("#FF4D6A", 0.08) : "rgba(255,255,255,0.02)",
                            "&:hover": {
                                background: alpha("#FF4D6A", 0.13),
                                borderColor: alpha("#FF4D6A", 0.5),
                            },
                        }}
                    >
                        Stop
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}

export function StartWorkerButton({
    pending,
    onStart
}) {
    return (
        <Button
            disabled={pending}
            onClick={onStart}
            startIcon={pending ? <CircularProgress size={15} /> : <Power size={15} />}
            sx={{
                minHeight: 40,
                px: 2,
                borderRadius: "12px",
                fontFamily: MONO,
                fontSize: "11px",
                letterSpacing: "1px",
                color: "#080B10",
                background: "linear-gradient(135deg, #00C8FF, #00E5A0)",
                boxShadow: "0 0 22px rgba(0,200,255,0.18)",
                "&:hover": {
                    boxShadow: "0 0 30px rgba(0,229,160,0.22)",
                },
                "&.Mui-disabled": {
                    color: "rgba(8,11,16,0.55)",
                    opacity: 0.7,
                },
            }}
        >
            Start Worker
        </Button>
    );
}
