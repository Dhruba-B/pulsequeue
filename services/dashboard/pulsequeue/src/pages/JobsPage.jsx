import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Stack,
    InputAdornment,
    GlobalStyles,
    alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { fetchJobs } from "../api/dashboardApi";
import JobsTable from "../components/tables/JobsTable";

const statuses = ["", "WAITING", "ACTIVE", "COMPLETED", "FAILED", "DELAYED"];

const STATUS_ACCENT = {
    "": "rgba(255,255,255,0.3)",
    WAITING: "#FFB800",
    ACTIVE: "#00C8FF",
    COMPLETED: "#00E5A0",
    FAILED: "#FF4D6A",
    DELAYED: "#7B8CDE",
};

// Shared input overrides so both fields look identical
const inputSx = {
    "& .MuiOutlinedInput-root": {
        fontFamily: "'Space Mono', monospace",
        fontSize: "13px",
        color: "rgba(255,255,255,0.75)",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
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

    const loadJobs = async () => {
        const res = await fetchJobs({ status, search });
        setJobs(res.data);
    };

    useEffect(() => { loadJobs(); }, [status, search]);

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
                {/* ── Page header ── */}
                <Box sx={{ mb: 5 }}>
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
                            mb: 1,
                        }}
                    >
                        Jobs
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "11px",
                            letterSpacing: "2px",
                            color: "rgba(255,255,255,0.2)",
                            textTransform: "uppercase",
                        }}
                    >
                        {jobs.length} result{jobs.length !== 1 ? "s" : ""}
                    </Typography>
                </Box>

                {/* ── Filters ── */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 4 }}>
                    {/* Search */}
                    <TextField
                        placeholder="Search jobs…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ minWidth: 300, ...inputSx }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Status filter */}
                    <TextField
                        select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{
                            width: { xs: "100%", sm: 200 },
                            ...inputSx,
                            // tint the border with the selected status colour
                            "& .MuiOutlinedInput-root fieldset": {
                                borderColor: status
                                    ? alpha(activeAccent, 0.35)
                                    : "rgba(255,255,255,0.08)",
                            },
                            "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                                borderColor: activeAccent,
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FilterListIcon
                                        sx={{ fontSize: 16, color: status ? `${activeAccent} !important` : undefined }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                        SelectProps={{ MenuProps: menuSx }}
                    >
                        {statuses.map((s) => (
                            <MenuItem key={s} value={s}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    {s && (
                                        <Box
                                            sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: "50%",
                                                background: STATUS_ACCENT[s],
                                                boxShadow: `0 0 6px ${STATUS_ACCENT[s]}`,
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                    {s || "ALL STATUSES"}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                {/* ── Table ── */}
                <JobsTable jobs={jobs} />
            </Box>
        </>
    );
}