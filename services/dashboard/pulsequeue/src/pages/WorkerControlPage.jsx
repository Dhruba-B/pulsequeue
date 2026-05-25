import { useEffect, useMemo, useState } from "react";
import {
    Box,
    CircularProgress,
    GlobalStyles,
    Grid,
    Paper,
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import { ServerCog, SquareStack } from "lucide-react";

import {
    fetchWorkerControls,
    startWorker,
    stopWorker,
    stopWorkers,
} from "../api/dashboardApi";
import socket from "../hooks/useSocket";
import InfraSnackbar from "../components/common/InfraSnackbar";
import WorkerControlCard, { StartWorkerButton } from "../components/workers/WorkerControlCard";
import WorkerLifecycleFeed from "../components/workers/WorkerLifecycleFeed";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const COLOR = {
    running: "#00E5A0",
    draining: "#FFB800",
    inactive: "#7B8CDE",
    info: "#00C8FF",
    danger: "#FF4D6A",
    border: "rgba(255,255,255,0.07)",
    borderFaint: "rgba(255,255,255,0.04)",
    surfaceA: "rgba(255,255,255,0.028)",
    surfaceB: "rgba(255,255,255,0.016)",
    text1: "#ffffff",
    text2: "rgba(255,255,255,0.52)",
    text3: "rgba(255,255,255,0.26)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const upsertWorker = (workers, next) => {
    const found = workers.some((w) => w.workerId === next.workerId);
    if (!found) return [next, ...workers];
    return workers.map((w) => (w.workerId === next.workerId ? { ...w, ...next } : w));
};

const makeOptimisticWorker = () => ({
    workerId: `pending-${Date.now()}`,
    status: "STARTING",
    pid: null,
    startedAt: Date.now(),
    updatedAt: Date.now(),
    optimistic: true,
});

// ─── SummaryCard ──────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, color, sublabel }) => (
    <Paper
        elevation={0}
        sx={{
            p: "20px 22px",
            borderRadius: "14px",
            background: COLOR.surfaceA,
            border: `1px solid ${COLOR.border}`,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            height: "100%",
            position: "relative",
            overflow: "hidden",
            "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: `linear-gradient(90deg, ${alpha(color, 0.7)}, transparent)`,
                borderRadius: "14px 14px 0 0",
            },
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Color dot accent */}
            <Box sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 10px ${alpha(color, 0.6)}`,
            }} />
            <Typography sx={{
                fontFamily: MONO,
                fontSize: "9px",
                letterSpacing: "2px",
                color: COLOR.text3,
                textTransform: "uppercase",
            }}>
                {label}
            </Typography>
        </Box>


        <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
            <Typography sx={{
                fontFamily: SYNE,
                fontSize: "36px",
                lineHeight: 1,
                fontWeight: 800,
                color,
                textShadow: `0 0 28px ${alpha(color, 0.3)}`,
            }}>
                {value}
            </Typography>


        </Stack>

        {sublabel && (
            <Typography sx={{
                fontFamily: MONO,
                fontSize: "9px",
                color: COLOR.text3,
                letterSpacing: "0.5px",
            }}>
                {sublabel}
            </Typography>
        )}
    </Paper>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
    <Typography sx={{
        fontFamily: MONO,
        fontSize: "9px",
        letterSpacing: "2px",
        color: COLOR.text3,
        textTransform: "uppercase",
        mb: 1.5,
    }}>
        {children}
    </Typography>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkerControlPage() {
    const [workers, setWorkers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [pendingStops, setPendingStops] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    const showSnackbar = (message, severity = "info") =>
        setSnackbar({ open: true, message, severity });

    const loadWorkers = async () => {
        const data = await fetchWorkerControls();
        setWorkers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchWorkerControls()
            .then((data) => { setWorkers(data); setLoading(false); })
            .catch(() => { setLoading(false); showSnackbar("Worker control plane is unreachable", "error"); });
    }, []);

    useEffect(() => {
        const onWorkerUpdated = (worker) => {
            if (!worker.workerId) return;
            setWorkers((prev) =>
                upsertWorker(prev.filter((w) => !w.optimistic), worker)
            );
            if (worker.status === "STOPPED" || worker.status === "EXITED") {
                setPendingStops((prev) => ({ ...prev, [worker.workerId]: false }));
            }
        };

        const onLifecycle = (event) => {
            setEvents((prev) => [event, ...prev].slice(0, 40));
            if (event.status === "STARTED") { setStarting(false); showSnackbar("Worker process started", "success"); }
            if (event.status === "STOPPED") { showSnackbar("Worker stopped gracefully", "success"); }
            if (event.status === "ERROR" || event.status === "EXITED") { showSnackbar("Worker exited unexpectedly", "error"); }
        };

        socket.on("worker_updated", onWorkerUpdated);
        socket.on("worker_lifecycle", onLifecycle);
        return () => {
            socket.off("worker_updated", onWorkerUpdated);
            socket.off("worker_lifecycle", onLifecycle);
        };
    }, []);

    const summary = useMemo(() => ({
        running: workers.filter((w) => w.status === "RUNNING").length,
        draining: workers.filter((w) => w.status === "STOPPING").length,
        stopped: workers.filter((w) => ["STOPPED", "EXITED", "ORPHANED"].includes(w.status)).length,
    }), [workers]);

    const handleStartWorker = async () => {
        const opt = makeOptimisticWorker();
        setStarting(true);
        setWorkers((prev) => [opt, ...prev]);
        try {
            const worker = await startWorker();
            setWorkers((prev) =>
                upsertWorker(prev.filter((w) => w.workerId !== opt.workerId), worker)
            );
            setStarting(false);
        } catch {
            setWorkers((prev) => prev.filter((w) => w.workerId !== opt.workerId));
            setStarting(false);
            showSnackbar("Failed to start worker", "error");
        }
    };

    const handleStopWorker = async (workerId) => {
        setPendingStops((prev) => ({ ...prev, [workerId]: true }));
        setWorkers((prev) =>
            prev.map((w) => w.workerId === workerId ? { ...w, status: "STOPPING" } : w)
        );
        try {
            await stopWorker(workerId);
            showSnackbar("Stop signal sent to worker", "info");
        } catch {
            setPendingStops((prev) => ({ ...prev, [workerId]: false }));
            await loadWorkers();
            showSnackbar("Failed to stop worker", "error");
        }
    };

    const handleStopAll = async () => {
        const runningIds = workers
            .filter((w) => w.status === "RUNNING" || w.status === "STARTING")
            .map((w) => w.workerId);

        if (runningIds.length === 0) { showSnackbar("No running managed workers", "info"); return; }

        setPendingStops((prev) => ({
            ...prev,
            ...Object.fromEntries(runningIds.map((id) => [id, true])),
        }));
        setWorkers((prev) =>
            prev.map((w) => runningIds.includes(w.workerId) ? { ...w, status: "STOPPING" } : w)
        );
        try {
            await stopWorkers();
            showSnackbar("Stop signals sent to all workers", "info");
        } catch {
            await loadWorkers();
            showSnackbar("Failed to stop worker fleet", "error");
        }
    };

    return (
        <>
            <GlobalStyles
                styles={{
                    "@import": "url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap')",
                    "*": { boxSizing: "border-box" },
                }}
            />

            <Box
                sx={{
                    minHeight: "100vh",
                    background: "#080B10",
                    backgroundImage: `
                        radial-gradient(ellipse 50% 32% at 92% 0%,   rgba(0,200,255,0.055),   transparent 62%),
                        radial-gradient(ellipse 36% 26% at 0%  92%,  rgba(0,229,160,0.04),    transparent 60%),
                        radial-gradient(ellipse 24% 18% at 50% 50%,  rgba(123,140,222,0.02),  transparent 70%)
                    `,
                    px: { xs: 2, sm: 3, md: 5, lg: 6 },
                    pt: { xs: 4, md: 5 },
                    pb: 8,
                }}
            >
                {/* ── Top bar ─────────────────────────────────────────────── */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 4 }}
                >
                    {/* Left: title block */}
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: "6px" }}>
                            <Box sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "10px",
                                background: alpha(COLOR.info, 0.1),
                                border: `1px solid ${alpha(COLOR.info, 0.2)}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: COLOR.info,
                                flexShrink: 0,
                            }}>
                                <ServerCog size={17} />
                            </Box>

                            <Typography sx={{
                                fontFamily: SYNE,
                                fontSize: { xs: "22px", md: "26px" },
                                fontWeight: 800,
                                background: "linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.5) 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                lineHeight: 1.15,
                            }}>
                                Worker Control
                            </Typography>
                        </Stack>

                        <Typography sx={{
                            fontFamily: MONO,
                            fontSize: "10px",
                            letterSpacing: "2px",
                            color: COLOR.text3,
                            textTransform: "uppercase",
                            pl: "46px", // align under title, past the icon
                        }}>
                            Managed process orchestration
                        </Typography>
                    </Box>

                    {/* Right: actions */}
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0, alignItems: "center", ml: { xs: 0, md: 2 } }}>
                        <StartWorkerButton pending={starting} onStart={handleStartWorker} />

                        <Box
                            component="button"
                            onClick={handleStopAll}
                            sx={{
                                height: 38,
                                px: "14px",
                                borderRadius: "10px",
                                fontFamily: MONO,
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "1px",
                                color: COLOR.danger,
                                border: `1px solid ${alpha(COLOR.danger, 0.25)}`,
                                background: alpha(COLOR.danger, 0.06),
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "7px",
                                transition: "background 0.15s, border-color 0.15s",
                                "&:hover": {
                                    background: alpha(COLOR.danger, 0.11),
                                    borderColor: alpha(COLOR.danger, 0.4),
                                },
                            }}
                        >
                            <SquareStack size={14} />
                            Stop Fleet
                        </Box>
                    </Stack>
                </Stack>

                {/* ── Divider ──────────────────────────────────────────────── */}
                <Box sx={{
                    height: "1px",
                    background: `linear-gradient(90deg, ${COLOR.border}, transparent)`,
                    mb: 3.5,
                }} />

                {/* ── Summary row ──────────────────────────────────────────── */}
                <Box sx={{ mb: 4 }}>
                    <SectionLabel>Fleet Overview</SectionLabel>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <SummaryCard
                                label="Running"
                                value={summary.running}
                                color={COLOR.running}
                                sublabel="Active worker processes"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <SummaryCard
                                label="Draining"
                                value={summary.draining}
                                color={COLOR.draining}
                                sublabel="Graceful shutdown in progress"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <SummaryCard
                                label="Inactive"
                                value={summary.stopped}
                                color={COLOR.inactive}
                                sublabel="Stopped, exited or orphaned"
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ── Main content ──────────────────────────────────────────── */}
                {loading ? (
                    <Box sx={{
                        minHeight: 320,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 2,
                    }}>
                        <CircularProgress size={26} thickness={2.5} sx={{ color: COLOR.info }} />
                        <Typography sx={{
                            fontFamily: MONO,
                            fontSize: "10px",
                            letterSpacing: "2px",
                            color: COLOR.text3,
                            textTransform: "uppercase",
                        }}>
                            Loading workers…
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3} alignItems="flex-start">

                        {/* ── Worker cards ── */}
                        <Grid item xs={12} lg={12} sx={{ width: "50%" }}>
                            <SectionLabel>
                                Workers
                                <Box component="span" sx={{
                                    ml: 1.5,
                                    px: "7px",
                                    py: "1px",
                                    borderRadius: "4px",
                                    background: COLOR.surfaceA,
                                    border: `1px solid ${COLOR.border}`,
                                    fontFamily: MONO,
                                    fontSize: "9px",
                                    color: COLOR.text3,
                                    letterSpacing: "1px",
                                    verticalAlign: "middle",
                                }}>
                                    {workers.length}
                                </Box>
                            </SectionLabel>

                            {workers.length === 0 ? (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        py: 7,
                                        px: 3,
                                        borderRadius: "14px",
                                        textAlign: "center",
                                        background: COLOR.surfaceB,
                                        border: `1px solid ${COLOR.borderFaint}`,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 2, width: "100%",
                                    }}
                                >
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "12px",
                                        background: COLOR.surfaceA,
                                        border: `1px solid ${COLOR.border}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: COLOR.text3,
                                    }}>
                                        <ServerCog size={18} />
                                    </Box>
                                    <Typography sx={{
                                        fontFamily: MONO,
                                        fontSize: "10px",
                                        letterSpacing: "2px",
                                        color: COLOR.text3,
                                        textTransform: "uppercase",
                                    }}>
                                        No managed workers registered
                                    </Typography>
                                    <Typography sx={{
                                        fontFamily: MONO,
                                        fontSize: "10px",
                                        color: COLOR.text3,
                                        opacity: 0.6,
                                    }}>
                                        Use "Start Worker" to spawn the first process
                                    </Typography>
                                </Paper>
                            ) : (
                                <Stack spacing={1.5}>
                                    {workers.map((worker) => (
                                        <WorkerControlCard
                                            key={worker.workerId}
                                            worker={worker}
                                            pending={Boolean(pendingStops[worker.workerId])}
                                            onStop={handleStopWorker}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Grid>

                        {/* ── Activity feed ── */}
                        <Grid item xs={12} lg={4} sx={{ width: "40%" }}>
                            <SectionLabel>Activity</SectionLabel>
                            <WorkerLifecycleFeed events={events} />
                        </Grid>
                    </Grid>
                )}
            </Box>

            <InfraSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            />
        </>
    );
}
