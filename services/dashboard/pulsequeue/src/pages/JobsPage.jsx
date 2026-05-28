import { useCallback, useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Stack,
    InputAdornment,
    GlobalStyles,
    Divider,
    alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

import { createJob, fetchJobs } from "../api/dashboardApi";
import JobsTable from "../components/tables/JobsTable";
import JobStartPanel from "../components/jobs/JobStartPanel";
import InfraSnackbar from "../components/common/InfraSnackbar";
import ExecutionLivePanel from "../components/execution/ExecutionLivePanel";
import { AI_JOB_TYPES } from "../components/ai/aiExecutionConfig";
import socket from "../hooks/useSocket";

const statuses = ["", "WAITING", "ACTIVE", "COMPLETED", "FAILED", "DELAYED"];
const AI_JOB_TYPE_SET = new Set(AI_JOB_TYPES);

const STATUS_ACCENT = {
    "": "rgba(255,255,255,0.3)",
    WAITING: "#FFB800",
    ACTIVE: "#00C8FF",
    COMPLETED: "#00E5A0",
    FAILED: "#FF4D6A",
    DELAYED: "#7B8CDE",
};

const inputSx = {
    "& .MuiOutlinedInput-root": {
        fontFamily: "'Space Mono', monospace",
        fontSize: "13px",
        color: "rgba(255,255,255,0.75)",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "10px",
        height: "40px",
        transition: "border-color 0.2s ease, background 0.2s ease",
        "& fieldset": {
            borderColor: "rgba(255,255,255,0.08)",
        },
        "&:hover fieldset": {
            borderColor: "rgba(255,255,255,0.15)",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#00C8FF",
            borderWidth: "1px",
        },
        "&.Mui-focused": {
            background: alpha("#00C8FF", 0.04),
        },
    },
    "& .MuiSvgIcon-root": {
        color: "rgba(255,255,255,0.25)",
    },
    "& .MuiSelect-icon": {
        color: "rgba(255,255,255,0.25)",
    },
};

const menuSx = {
    PaperProps: {
        sx: {
            background: "#0E1420",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            mt: 1,
            "& .MuiMenuItem-root": {
                fontFamily: "'Space Mono', monospace",
                fontSize: "12px",
                letterSpacing: "1px",
                color: "rgba(255,255,255,0.5)",
                py: "10px",
                px: "16px",
                transition: "background 0.15s ease, color 0.15s ease",
                "&:hover": {
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                },
                "&.Mui-selected": {
                    background: alpha("#00C8FF", 0.08),
                    color: "#00C8FF",
                    "&:hover": { background: alpha("#00C8FF", 0.12) },
                },
            },
        },
    },
};

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [liveExecutionId, setLiveExecutionId] = useState("");
    const [executionEvents, setExecutionEvents] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const showSnackbar = (message, severity = "info") => {
        setSnackbar({ open: true, message, severity });
    };

    const loadJobs = useCallback(async () => {
        const res = await fetchJobs({ status, search });
        setJobs(res.data.filter((job) => AI_JOB_TYPE_SET.has(job.type)));
    }, [status, search]);

    useEffect(() => {
        fetchJobs({ status, search }).then((res) => setJobs(res.data.filter((job) => AI_JOB_TYPE_SET.has(job.type))));
    }, [status, search]);

    useEffect(() => {
        const refreshJobs = () => loadJobs();
        const addExecutionEvent = (event) => {
            setExecutionEvents((prev) => [event, ...prev].slice(0, 80));
            refreshJobs();
        };

        socket.on("ai_activity", addExecutionEvent);
        socket.on("job_created", refreshJobs);

        return () => {
            socket.off("ai_activity", addExecutionEvent);
            socket.off("job_created", refreshJobs);
        };
    }, [loadJobs]);

    const handleCreateJob = async (job) => {
        setSubmitting(true);
        try {
            const createdJob = await createJob(job);
            setJobs((prev) => [createdJob, ...prev]);
            setLiveExecutionId(createdJob.id);
            setExecutionEvents((prev) => [
                {
                    type: "JOB_CREATED",
                    message: `${createdJob.type} accepted by control plane`,
                    timestamp: createdJob.createdAt,
                    payload: createdJob,
                },
                ...prev,
            ].slice(0, 80));
            showSnackbar(`${createdJob.type} execution dispatched`, "success");
            await loadJobs();
        } catch {
            showSnackbar("Failed to dispatch execution", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const activeAccent = STATUS_ACCENT[status];

    return (
        <>
            <GlobalStyles
                styles={{
                    "@import": "url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap')",
                }}
            />

            <Box
                sx={{
                    minHeight: "100vh",
                    background: "#080B10",
                    backgroundImage: `
                        radial-gradient(ellipse 55% 35% at 80% 5%, rgba(0,200,255,0.05) 0%, transparent 60%),
                        radial-gradient(ellipse 40% 25% at 5% 90%, rgba(123,140,222,0.05) 0%, transparent 60%)
                    `,
                    px: { xs: 2.5, md: 5 },
                    pt: 5,
                    pb: 8,
                }}
            >
                {/* ── Max-width content column ── */}
                <Box sx={{ maxWidth: 1280, mx: "auto" }}>

                    {/* ── Page header ── */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            mb: 3,
                            flexWrap: "wrap",
                            gap: 1,
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: { xs: "26px", md: "32px" },
                                    fontWeight: 800,
                                    letterSpacing: "-0.5px",
                                    background: "linear-gradient(90deg, #fff 40%, rgba(255,255,255,0.4))",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    lineHeight: 1.1,
                                    mb: 0.75,
                                }}
                            >
                                AI Execution Console
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "11px",
                                    letterSpacing: "2px",
                                    color: "rgba(255,255,255,0.2)",
                                    textTransform: "uppercase",
                                    fontFamily: "'Space Mono', monospace",
                                }}
                            >
                                {jobs.length} execution{jobs.length !== 1 ? "s" : ""}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 4 }} />

                    {/* ── Enqueue panel ── */}
                    <Box sx={{ mb: 4 }}>
                        <JobStartPanel submitting={submitting} onSubmit={handleCreateJob} />
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <ExecutionLivePanel executionId={liveExecutionId} events={executionEvents} />
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 3 }} />

                    {/* ── Filter bar ── */}
                    <Stack sx={{ mb: 3, flexDirection: { xs: "column", sm: "row" }, gap: 1.5, alignItems: { xs: "stretch", sm: "center" } }}>
                        <TextField
                            placeholder="Search executions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ flex: 1, maxWidth: { sm: 360 }, ...inputSx }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 16 }} />
                                    </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            sx={{
                                width: { xs: "100%", sm: 200 },
                                flexShrink: 0,
                                ...inputSx,
                                "& .MuiOutlinedInput-root fieldset": {
                                    borderColor: status
                                        ? alpha(activeAccent, 0.35)
                                        : "rgba(255,255,255,0.08)",
                                },
                                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                                    borderColor: activeAccent,
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                    <InputAdornment position="start">
                                        <FilterListIcon
                                            sx={{
                                                fontSize: 16,
                                                color: status
                                                    ? `${activeAccent} !important`
                                                    : undefined,
                                            }}
                                        />
                                    </InputAdornment>
                                    ),
                                },
                                select: { MenuProps: menuSx },
                            }}
                        >
                            {statuses.map((item) => (
                                <MenuItem key={item} value={item}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {item && (
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    background: STATUS_ACCENT[item],
                                                    boxShadow: `0 0 6px ${STATUS_ACCENT[item]}`,
                                                    flexShrink: 0,
                                                }}
                                            />
                                        )}
                                        {item || "ALL STATUSES"}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Live result count aligned to the right on desktop */}
                        <Box
                            sx={{
                                display: { xs: "none", sm: "flex" },
                                alignItems: "center",
                                ml: "auto !important",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: "11px",
                                    letterSpacing: "1.5px",
                                    color: "rgba(255,255,255,0.18)",
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {jobs.length} result{jobs.length !== 1 ? "s" : ""}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* ── Table ── */}
                    <JobsTable jobs={jobs} />

                </Box>
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
