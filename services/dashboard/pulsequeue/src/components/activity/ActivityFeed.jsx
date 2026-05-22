import { useState, useEffect, useRef } from "react";
import { Paper, Typography, Stack, Box, alpha } from "@mui/material";
import { keyframes } from "@emotion/react";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const liveBlink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
`;

// ─── Event type config ────────────────────────────────────────────────────────
const EVENT_CONFIG = {
    JOB_COMPLETED: { color: "#00E5A0", bgColor: "rgba(0,229,160,0.08)", borderColor: "rgba(0,229,160,0.2)", label: "Completed" },
    JOB_FAILED: { color: "#FF4D6A", bgColor: "rgba(255,77,106,0.08)", borderColor: "rgba(255,77,106,0.2)", label: "Failed" },
    JOB_STARTED: { color: "#00C8FF", bgColor: "rgba(0,200,255,0.08)", borderColor: "rgba(0,200,255,0.2)", label: "Started" },
    JOB_DELAYED: { color: "#7B8CDE", bgColor: "rgba(123,140,222,0.08)", borderColor: "rgba(123,140,222,0.2)", label: "Delayed" },
    WORKER_ONLINE: { color: "#00E5A0", bgColor: "rgba(0,229,160,0.08)", borderColor: "rgba(0,229,160,0.2)", label: "Worker Up" },
    WORKER_OFFLINE: { color: "#FF4D6A", bgColor: "rgba(255,77,106,0.08)", borderColor: "rgba(255,77,106,0.2)", label: "Worker Dn" },
};

const FILTERS = ["All", "Jobs", "Workers", "Errors"];

const getConfig = (type) =>
    EVENT_CONFIG[type] || { color: "#FFB800", bgColor: "rgba(255,184,0,0.08)", borderColor: "rgba(255,184,0,0.2)", label: type };

const matchesFilter = (event, filter) => {
    if (filter === "All") return true;
    if (filter === "Jobs") return event.type.startsWith("JOB_");
    if (filter === "Workers") return event.type.startsWith("WORKER_");
    if (filter === "Errors") return event.type === "JOB_FAILED";
    return true;
};

const fmtRelative = (ts) => {
    const secs = Math.floor((Date.now() - Number(ts)) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return new Date(Number(ts)).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ type }) => {
    const { color, bgColor, borderColor, label } = getConfig(type);
    return (
        <Box sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            px: "8px",
            py: "3px",
            borderRadius: "5px",
            background: bgColor,
            border: `1px solid ${borderColor}`,
            flexShrink: 0,
            width: "fit-content",
        }}>
            <Box sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
            }} />
            <Typography sx={{
                fontFamily: MONO,
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.8px",
                color,
                lineHeight: 1,
                whiteSpace: "nowrap",
            }}>
                {label}
            </Typography>
        </Box>
    );
};

// ─── Table Row ────────────────────────────────────────────────────────────────
const EventRow = ({ event, isNew }) => {
    const time = event.timestamp ? fmtRelative(event.timestamp) : "—";

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 90px 68px",
                alignItems: "center",
                gap: "8px",
                px: "16px",
                py: "9px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                animation: isNew ? `${slideIn} 0.3s ease both` : "none",
                transition: "background 0.12s",
                "&:last-child": { borderBottom: "none" },
                "&:hover": { background: "rgba(255,255,255,0.025)" },
            }}
        >
            {/* Status */}
            <Box sx={{ display: "flex", alignItems: "center" }}><StatusBadge type={event.type} /></Box>

            {/* Message */}
            <Typography sx={{
                fontFamily: MONO,
                fontSize: "11px",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.4,
            }}
                title={event.message}
            >
                {event.message}
            </Typography>

            {/* Worker / source */}
            <Typography noWrap sx={{
                fontFamily: MONO,
                fontSize: "10px",
                color: "rgba(255,255,255,0.22)",
                letterSpacing: "0.3px",
            }}>
                {event.worker || "—"}
            </Typography>

            {/* Time */}
            <Typography sx={{
                fontFamily: MONO,
                fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                textAlign: "right",
                whiteSpace: "nowrap",
                letterSpacing: "0.3px",
            }}>
                {time}
            </Typography>
        </Box>
    );
};

// ─── Filter Button ────────────────────────────────────────────────────────────
const FilterBtn = ({ label, active, onClick }) => (
    <Box
        component="button"
        onClick={onClick}
        sx={{
            fontFamily: MONO,
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.8px",
            px: "9px",
            py: "3px",
            borderRadius: "4px",
            border: active
                ? "1px solid rgba(255,255,255,0.18)"
                : "1px solid rgba(255,255,255,0.06)",
            background: active ? "rgba(255,255,255,0.07)" : "transparent",
            color: active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
            cursor: "pointer",
            transition: "all 0.12s",
            "&:hover": {
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.55)",
            },
        }}
    >
        {label}
    </Box>
);

// ─── Column Header ────────────────────────────────────────────────────────────
const ColHeader = ({ children, align = "left" }) => (
    <Typography sx={{
        fontFamily: MONO,
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.2px",
        color: "rgba(255,255,255,0.2)",
        textTransform: "uppercase",
        textAlign: align,
    }}>
        {children}
    </Typography>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ActivityFeed({ events = [] }) {
    const [filter, setFilter] = useState("All");
    const [tick, setTick] = useState(0);

    // Refresh relative timestamps every 15s
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 15000);
        return () => clearInterval(id);
    }, []);

    const filtered = events.filter(e => matchesFilter(e, filter));

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: "16px",
                background: "rgba(255,255,255,0.028)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: "60%",
            }}
        >
            {/* ── Header ── */}
            <Box sx={{
                px: "16px",
                py: "13px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
            }}>
                <Typography sx={{
                    fontFamily: SYNE,
                    fontWeight: 800,
                    fontSize: "14px",
                    color: "#fff",
                    lineHeight: 1,
                    letterSpacing: "-0.2px",
                }}>
                    Activity
                </Typography>

                {/* Live pill */}
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{
                    px: "8px",
                    py: "4px",
                    borderRadius: "20px",
                    background: alpha("#00E5A0", 0.07),
                    border: `1px solid ${alpha("#00E5A0", 0.18)}`,
                }}>
                    <Box sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#00E5A0",
                        animation: `${liveBlink} 1.4s ease-in-out infinite`,
                        flexShrink: 0,
                    }} />
                    <Typography sx={{
                        fontFamily: MONO,
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        color: "#00E5A0",
                    }}>
                        LIVE
                    </Typography>
                </Stack>
            </Box>

            {/* ── Column headers ── */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 90px 68px",
                gap: "8px",
                px: "16px",
                py: "7px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.08)",
                flexShrink: 0,
                textAlign: "center",
            }}>
                <ColHeader>Status</ColHeader>
                <ColHeader align="center">Message</ColHeader>
                <ColHeader>Source</ColHeader>
                <ColHeader align="right">Time</ColHeader>
            </Box>

            {/* ── Rows ── */}
            <Box sx={{
                flex: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: "3px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "99px",
                },
            }}>
                {filtered.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography sx={{
                            fontFamily: MONO,
                            fontSize: "10px",
                            letterSpacing: "2px",
                            color: "rgba(255,255,255,0.15)",
                            textTransform: "uppercase",
                        }}>
                            No events match this filter
                        </Typography>
                    </Box>
                ) : (
                    filtered.map((event, i) => (
                        <EventRow key={i} event={event} isNew={i === 0 && filter === "All"} />
                    ))
                )}
            </Box>

            {/* ── Footer ── */}
            <Box sx={{
                px: "16px",
                py: "9px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
            }}>
                <Typography sx={{
                    fontFamily: MONO,
                    fontSize: "9px",
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.18)",
                }}>
                    {filtered.length} event{filtered.length !== 1 ? "s" : ""}
                </Typography>

                <Stack direction="row" spacing={0.5}>
                    {FILTERS.map(f => (
                        <FilterBtn
                            key={f}
                            label={f}
                            active={filter === f}
                            onClick={() => setFilter(f)}
                        />
                    ))}
                </Stack>
            </Box>
        </Paper>
    );
}