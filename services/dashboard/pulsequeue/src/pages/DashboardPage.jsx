import { useEffect, useState, useRef } from "react";
import {
    Box,
    CircularProgress,
    Divider,
    GlobalStyles,
    Grid,
    Paper,
    Tooltip,
    Typography,
    createTheme,
    ThemeProvider,
    alpha,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { fetchStats } from "../api/dashboardApi";
import socket from "../hooks/useSocket";
import ActivityFeed from "../components/activity/ActivityFeed";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
    palette: {
        mode: "dark",

        background: {
            default: "#080B10",

            paper: "rgba(18, 24, 38, 0.92)"
        },

        text: {
            primary: "#F5F7FA",

            secondary: "rgba(255,255,255,0.72)"
        },
    },
    typography: {
        fontFamily: "'Space Mono', monospace",
    },
    shape: { borderRadius: 16 },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: "none", backdropFilter: "blur(12px)" },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { backgroundImage: "none", backdropFilter: "blur(12px)" },
            },
        },
    },
});

// ─── Keyframe animations ──────────────────────────────────────────────────────
const alertPulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
`;
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const blink = keyframes`
  50% { opacity: 0; }
`;

// ─── Card metadata ────────────────────────────────────────────────────────────
const CARD_META = {
    waiting: { label: "WAITING", accent: "#FFB800", icon: "⏳", unit: "jobs" },
    completed: { label: "COMPLETED", accent: "#00E5A0", icon: "✓", unit: "jobs" },
    failed: { label: "FAILED", accent: "#FF4D6A", icon: "✕", unit: "jobs" },
    delayed: { label: "DELAYED", accent: "#7B8CDE", icon: "⧖", unit: "jobs" },
    activeWorkers: { label: "WORKERS", accent: "#00C8FF", icon: "⚡", unit: "active" },
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline = ({ color, data }) => {
    const w = 80, h = 28;
    const max = Math.max(...data, 1);
    const pts = data
        .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
        .join(" ");
    return (
        <Box component="svg" width={w} height={h} sx={{ overflow: "visible" }}>
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Box>
    );
};

// ─── Count-up hook ────────────────────────────────────────────────────────────
const useCountUp = (target, duration = 600) => {
    const [display, setDisplay] = useState(target);
    const prev = useRef(target);
    useEffect(() => {
        const start = prev.current;
        const diff = target - start;
        if (diff === 0) return;
        const steps = 20;
        let step = 0;
        const id = setInterval(() => {
            step++;
            setDisplay(Math.round(start + diff * (step / steps)));
            if (step >= steps) { clearInterval(id); prev.current = target; }
        }, duration / steps);
        return () => clearInterval(id);
    }, [target, duration]);
    return display;
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ statKey, value, index }) => {
    const { label, accent, icon, unit } = CARD_META[statKey];
    const displayed = useCountUp(value);
    const [history, setHistory] = useState(() => Array(12).fill(value));
    const isAlert = statKey === "failed" && value > 0;

    useEffect(() => {
        const id = setTimeout(() => {
            setHistory(h => [...h.slice(1), value]);
        }, 0);

        return () => clearTimeout(id);
    }, [value]);

    return (
        <Paper
            elevation={0}
            sx={{
                position: "relative",
                p: "22px 20px 18px",
                border: "1px solid",
                borderColor: "rgba(255,255,255,0.07)",
                borderRadius: 1,
                overflow: "hidden",
                cursor: "default",
                animation: `${cardIn} 0.5s both cubic-bezier(0.22,1,0.36,1)`,
                animationDelay: `${index * 80}ms`,
                transition: "transform 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: alpha(accent, 0.4),
                    "& .card-glow": { opacity: 1 },
                },
            }}
        >
            {/* Alert ring */}
            {isAlert && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: -1,
                        borderRadius: 1,
                        border: "2px solid",
                        borderColor: alpha("#FF4D6A", 0.6),
                        animation: `${alertPulse} 1.5s ease-in-out infinite`,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Hover glow */}
            <Box
                className="card-glow"
                sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 1,
                    background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${alpha(accent, 0.12)}, transparent)`,
                    pointerEvents: "none",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                }}
            />

            {/* Icon + label row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "14px" }}>
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 2,
                        background: alpha(accent, 0.15),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        color: accent,
                    }}
                >
                    {icon}
                </Box>
                <Typography
                    component="span"
                    sx={{
                        letterSpacing: "2px",
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 700,
                        fontSize: "10px",
                        lineHeight: 1,
                    }}
                >
                    {label}
                </Typography>
            </Box>

            {/* Value */}
            <Typography
                sx={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "42px",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: accent,
                    textShadow: `0 0 30px ${alpha(accent, 0.5)}`,
                    mb: "14px",
                    transition: "text-shadow 0.3s ease",
                }}
            >
                {displayed.toLocaleString()}
            </Typography>

            {/* Footer */}
            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <Typography
                    sx={{
                        fontSize: "10px",
                        letterSpacing: "1.5px",
                        color: "rgba(255,255,255,0.5)",
                        textTransform: "uppercase",
                    }}
                >
                    {unit}
                </Typography>
                <Sparkline color={accent} data={history} />
            </Box>
        </Paper>
    );
};

// ─── Throughput bar ───────────────────────────────────────────────────────────
const ThroughputBar = ({ stats }) => {
    if (!stats) return null;
    const total = stats.waiting + stats.completed + stats.failed + stats.delayed;
    if (total === 0) return null;

    const segments = [
        { key: "completed", color: "#00E5A0" },
        { key: "waiting", color: "#FFB800" },
        { key: "delayed", color: "#7B8CDE" },
        { key: "failed", color: "#FF4D6A" },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 1,
                p: "22px 24px",
                maxWidth: 600,
            }}
        >
            <Typography
                sx={{
                    fontSize: "10px",
                    letterSpacing: "3px",
                    color: "rgba(255,255,255,0.7)",
                    mb: "14px",
                }}
            >
                JOB DISTRIBUTION
            </Typography>

            {/* Bar */}
            <Box
                sx={{
                    height: 8,
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    overflow: "hidden",
                    gap: "2px",
                    mb: "12px",
                }}
            >
                {segments.map(({ key, color }) => {
                    const pct = (stats[key] / total) * 100;
                    return pct > 0 ? (
                        <Tooltip key={key} title={`${CARD_META[key].label}: ${stats[key]}`} arrow>
                            <Box
                                sx={{
                                    width: `${pct}%`,
                                    background: color,
                                    borderRadius: 99,
                                    transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
                                }}
                            />
                        </Tooltip>
                    ) : null;
                })}
            </Box>

            {/* Legend */}
            <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {segments.map(({ key, color }) => (
                    <Box key={key} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                        <Typography sx={{ fontSize: "10px", letterSpacing: "1px", color: "rgba(255,255,255,0.35)" }}>
                            {CARD_META[key].label} {Math.round((stats[key] / total) * 100)}%
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
    <Typography
        sx={{
            fontSize: "10px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            mb: "20px",
        }}
    >
        {children}
    </Typography>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const statOrder = ["waiting", "completed", "failed", "delayed", "activeWorkers"];

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        socket.on("job_created", (job) => {
            setEvents((prev) => [
                {
                    type: "JOB CREATED",
                    message: `${job.type} created`,
                    worker: job.workerId,
                    time: new Date(job.timestamp).toLocaleTimeString(),
                },
                ...prev,
            ]);
        });

        socket.on("job_completed", (job) => {
            setEvents((prev) => [
                {
                    type: "JOB COMPLETED",
                    message: `${job.jobId} ${job.type} completed`,
                    worker: job.workerId,
                    time: new Date(job.timestamp).toLocaleTimeString(),
                },
                ...prev,
            ]);
        });

        socket.on("job_failed", (job) => {
            setEvents((prev) => [
                {
                    type: "JOB FAILED",
                    message: `${job.jobId} ${job.type} failed`,
                    worker: job.workerId,
                    time: new Date(job.timestamp).toLocaleTimeString(),
                },
                ...prev,
            ]);
        });

        return () => {
            socket.off("job_created");
            socket.off("job_completed");
        };
    }, []);


    const loadStats = async () => {
        const data = await fetchStats();
        setStats(data);
    };

    useEffect(() => {
        fetchStats().then(setStats);
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            {/* Global font import + body reset */}
            <GlobalStyles
                styles={{
                    "@import": "url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap')",
                    "*, *::before, *::after": { boxSizing: "border-box", margin: 0, padding: 0 },
                    body: { background: "#080B10" },
                }}
            />
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Box
                        sx={{
                            minHeight: "100vh",
                            background: "#080B10",
                            pb: 8,
                            overflowX: "hidden",
                        }}
                    >

                        {/* ── Loading state ── */}
                        {!stats ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: "80vh",
                                    gap: 2,
                                }}
                            >
                                <CircularProgress
                                    size={32}
                                    thickness={2}
                                    sx={{ color: "rgba(0,200,255,0.5)" }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        letterSpacing: "3px",
                                        color: "rgba(0,200,255,0.5)",
                                        textTransform: "uppercase",
                                        animation: `${blink} 1s steps(1) infinite`,
                                    }}
                                >
                                    Connecting
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ px: { xs: 2.5, md: 5 }, pt: 5 }}>

                                {/* ── Stat cards ── */}
                                <SectionLabel>Queue Metrics</SectionLabel>
                                <Grid container spacing={2} sx={{ mb: 4 }}>
                                    {statOrder.map((key, i) => (
                                        <Grid
                                            item
                                            key={key}
                                            xs={6}
                                            sm={4}
                                            sx={{ flexGrow: 1, flexBasis: { md: "20%" }, maxWidth: { md: "20%" } }}
                                        >
                                            <StatCard statKey={key} value={stats[key] ?? 0} index={i} />
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* ── Divider ── */}
                                <Divider
                                    sx={{
                                        my: 1,
                                        mb: 4,
                                        borderColor: "transparent",
                                        backgroundImage:
                                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                                        height: "1px",
                                        border: "none",
                                    }}
                                />

                                {/* ── Throughput ── */}
                                <SectionLabel>Overview</SectionLabel>
                                <ThroughputBar stats={stats} />
                            </Box>
                        )}

                    </Box>
                </Grid>
                <Grid item xs={12} lg={4} sx={{ pb: 8, flex: 1 }}>
                    <ActivityFeed events={events} />
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
