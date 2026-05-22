import {
    Paper,
    Box,
    Stack,
    Typography,
    Tooltip,
    alpha,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CircuitBoardIcon from "@mui/icons-material/Memory";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

// ─── Circular SVG gauge ───────────────────────────────────────────────────────
const CircleGauge = ({ value = 0, color, label }) => {
    const r = 32;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(value, 100) / 100) * circ;
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <svg width={88} height={88} viewBox="0 0 88 88" style={{ overflow: "visible" }}>
                {/* Track */}
                <circle
                    cx={44} cy={44} r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={7}
                />
                {/* Fill */}
                <circle
                    cx={44} cy={44} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 44 44)"
                    style={{ filter: `drop-shadow(0 0 4px ${alpha(color, 0.55)})`, transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)" }}
                />
                {/* Value text */}
                <text
                    x={44} y={40}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontFamily: MONO, fontSize: "13px", fontWeight: 700, fill: "#fff" }}
                >
                    {value}%
                </text>
                {/* Sub label */}
                <text
                    x={44} y={55}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "1.5px", fill: "rgba(255,255,255,0.3)" }}
                >
                    {label}
                </text>
            </svg>
        </Box>
    );
};

// ─── Mini metric tile ─────────────────────────────────────────────────────────
const MetricTile = ({ icon, label, value, color }) => (
    <Box sx={{
        flex: 1,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.055)",
        borderRadius: "12px",
        p: "10px 12px",
    }}>
        <Stack direction="row" alignItems="center" spacing={0.6} mb="7px">
            <Box sx={{ display: "flex", color, fontSize: 14, lineHeight: 1 }}>{icon}</Box>
            <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                {label}
            </Typography>
        </Stack>
        <Stack direction="row" alignItems="baseline" spacing={0.5} mb="8px">
            <Typography sx={{ fontFamily: MONO, fontSize: "22px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {value}
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>%</Typography>
        </Stack>
        {/* Thin bar */}
        <Box sx={{ height: "3px", borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <Box sx={{
                width: `${Math.min(value, 100)}%`,
                height: "100%",
                borderRadius: 99,
                background: color,
                boxShadow: `0 0 6px ${alpha(color, 0.55)}`,
                transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
            }} />
        </Box>
    </Box>
);

// ─── Bottom stat cell ─────────────────────────────────────────────────────────
const StatCell = ({ label, value, valueColor, align = "left" }) => (
    <Box sx={{
        flex: 1,
        px: "16px",
        py: "12px",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        textAlign: align,
        "&:last-child": { borderRight: "none" },
    }}>
        <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", mb: "5px" }}>
            {label}
        </Typography>
        <Typography sx={{ fontFamily: MONO, fontSize: "14px", fontWeight: 700, color: valueColor || "#fff", lineHeight: 1 }}>
            {value}
        </Typography>
    </Box>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function WorkerCard({ worker }) {
    const accent = worker.isAlive ? "#00E5A0" : "#FF4D6A";
    const statusLabel = worker.isAlive ? "Online" : "Offline";

    return (
        <Paper elevation={0} sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(16px)",
            transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
            "&:hover": {
                transform: "translateY(-3px)",
                borderColor: alpha(accent, 0.35),
                boxShadow: `0 12px 36px ${alpha(accent, 0.09)}`,
                "& .wc-glow": { opacity: 1 },
            },
        }}>
            {/* Top accent line */}
            <Box sx={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                opacity: worker.isAlive ? 0.85 : 0.35,
            }} />

            {/* Ambient glow */}
            <Box className="wc-glow" sx={{
                position: "absolute", width: 200, height: 200, borderRadius: "50%",
                background: alpha(accent, 0.07), filter: "blur(55px)",
                top: -90, right: -70, opacity: 0.4, pointerEvents: "none",
                transition: "opacity 0.3s ease",
            }} />

            {/* ── Top section: left panel + right gauges ── */}
            <Stack direction="row" sx={{ alignItems: "stretch" }}>

                {/* Left panel */}
                <Box sx={{
                    flex: 1,
                    p: "20px",
                    borderRight: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                }}>
                    {/* Identity row */}
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontFamily: SYNE, fontWeight: 800, fontSize: "16px", color: "#fff", lineHeight: 1, mb: "7px" }}>
                                Worker Node
                            </Typography>
                            <Tooltip title={worker.workerId} placement="top">
                                <Typography noWrap sx={{
                                    fontFamily: MONO, fontSize: "10px", letterSpacing: "0.5px",
                                    color: "#00C8FF",
                                    background: alpha("#00C8FF", 0.08),
                                    border: `1px solid ${alpha("#00C8FF", 0.2)}`,
                                    borderRadius: "6px", px: "8px", py: "3px",
                                    display: "inline-block", maxWidth: "185px",
                                }}>
                                    {worker.workerId}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Stack>

                    {/* Current job */}
                    <Box sx={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "rgba(255,255,255,0.022)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "10px", px: "12px", py: "9px",
                    }}>
                        <WorkOutlineIcon sx={{ fontSize: 14, flexShrink: 0, color: worker.currentJob ? "#00C8FF" : "rgba(255,255,255,0.18)" }} />
                        <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", flexShrink: 0, alignSelf: "end" }}>
                            Job
                        </Typography>
                        <Tooltip title={worker.currentJob || ""} placement="top">
                            <Typography noWrap sx={{
                                fontFamily: MONO, fontSize: "12px",
                                color: worker.currentJob ? "#00C8FF" : "rgba(255,255,255,0.75)",
                            }}>
                                {worker.currentJob || "Idle"}
                            </Typography>
                        </Tooltip>
                    </Box>

                    {/* Metric tiles */}
                    <Stack direction="row" spacing="10px">
                        <MetricTile
                            icon={<BoltIcon fontSize="inherit" />}
                            label="CPU"
                            value={worker.cpuLoad ?? 0}
                            color="#FFB800"
                        />
                        <MetricTile
                            icon={<CircuitBoardIcon fontSize="inherit" />}
                            label="Memory"
                            value={worker.memoryUsage ?? 0}
                            color="#7B8CDE"
                        />
                    </Stack>
                </Box>

                {/* Right gauges panel */}
                <Box sx={{
                    width: "160px",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "14px",
                    px: "16px",
                    py: "20px",
                    background: "rgba(0,0,0,0.15)",
                }}>
                    <CircleGauge value={worker.cpuLoad ?? 0} color="#FFB800" label="CPU" />
                    <CircleGauge value={worker.memoryUsage ?? 0} color="#7B8CDE" label="MEM" />
                </Box>
            </Stack>

            {/* ── Bottom stats strip ── */}
            <Stack direction="row" sx={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <StatCell label="Jobs Processed" value={(worker.processedJobs ?? 0).toLocaleString()} />
                <StatCell
                    label="Heartbeat"
                    value={new Date(Number(worker.lastSeen)).toLocaleTimeString("en-US", { hour12: false })}
                />
                <StatCell label="Status" value={statusLabel} valueColor={accent} />
                <StatCell
                    label="Worker ID"
                    value={worker.workerId?.slice(0, 8) ?? "—"}
                    valueColor="rgba(255,255,255,0.4)"
                />
            </Stack>
        </Paper>
    );
}