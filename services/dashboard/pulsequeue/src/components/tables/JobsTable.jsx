import { Fragment, useState } from "react";
import { Box, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import StatusChip from "../common/StatusChip";
import AiJobResultViewer from "../jobs/AiJobResultViewer";
import JobExecutionTimeline from "../jobs/JobExecutionTimeline";

const MONO = "'Space Mono', monospace";

const COL_STYLES = {
    fontFamily: MONO,
    fontSize: "10px",
    letterSpacing: "2px",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    fontWeight: 700,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    py: "14px",
    px: "16px",
    whiteSpace: "nowrap",
};

const CELL_STYLES = {
    fontFamily: MONO,
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    py: "14px",
    px: "16px",
};

const PRIORITY_COLOR = {
    HIGH: { color: "#FF4D6A", bg: alpha("#FF4D6A", 0.1) },
    MEDIUM: { color: "#FFB800", bg: alpha("#FFB800", 0.1) },
    LOW: { color: "#7B8CDE", bg: alpha("#7B8CDE", 0.1) },
};

const PriorityBadge = ({ priority }) => {
    const { color, bg } = PRIORITY_COLOR[priority] || { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)" };
    return (
        <Box component="span" sx={{ display: "inline-block", px: "8px", py: "3px", borderRadius: "6px", fontSize: "10px", fontFamily: MONO, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, color, background: bg, border: `1px solid ${alpha(color, 0.25)}` }}>
            {priority || "-"}
        </Box>
    );
};

const fmtDuration = (duration) => {
    if (duration == null) return "-";
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
};

const durationBetween = (start, end) => {
    if (!start || !end) return null;
    return Math.max(0, Number(end) - Number(start));
};

const JobRow = ({ job }) => {
    const [open, setOpen] = useState(false);
    const execution = job.execution || {};
    const model = execution.model || job.result?.model || "-";
    const runtime = execution.runtime || job.result?.runtime || "-";
    const capability = execution.preferredCapability || job.type;
    const queueLatency = durationBetween(job.createdAt, job.processedAt);
    const workerType = job.workerType || job.worker?.type || runtime.split("/")[0] || "-";

    return (
        <Fragment>
            <TableRow sx={{ transition: "background 0.15s ease", "&:hover": { background: "rgba(255,255,255,0.03)" } }}>
                <TableCell sx={{ ...CELL_STYLES, width: 44 }}>
                    <IconButton size="small" onClick={() => setOpen((prev) => !prev)} sx={{ color: "rgba(255,255,255,0.55)" }}>
                        {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={CELL_STYLES}>
                    <Box component="span" sx={{ fontFamily: MONO, fontSize: "12px", color: "#00C8FF", background: alpha("#00C8FF", 0.08), border: `1px solid ${alpha("#00C8FF", 0.2)}`, borderRadius: "6px", px: "8px", py: "3px", letterSpacing: "0.5px" }}>
                        {job.id.slice(0, 8)}
                    </Box>
                </TableCell>
                <TableCell sx={CELL_STYLES}>
                    <Box>
                        <Typography sx={{ fontFamily: MONO, fontSize: 12, color: "#fff" }}>{job.type}</Typography>
                        <Typography sx={{ mt: 0.3, fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.32)" }}>{capability}</Typography>
                    </Box>
                </TableCell>
                <TableCell sx={CELL_STYLES}><StatusChip status={job.status} /></TableCell>
                <TableCell sx={CELL_STYLES}><PriorityBadge priority={job.priority} /></TableCell>
                <TableCell sx={CELL_STYLES}>
                    <Typography noWrap sx={{ maxWidth: 150, fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.62)" }}>{model}</Typography>
                    <Typography noWrap sx={{ mt: 0.3, maxWidth: 150, fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.28)" }}>{runtime}</Typography>
                </TableCell>
                <TableCell sx={CELL_STYLES}>
                    <Typography noWrap sx={{ maxWidth: 150, fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.42)" }}>{job.workerId || "-"}</Typography>
                    <Typography noWrap sx={{ mt: 0.3, maxWidth: 150, fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{workerType}</Typography>
                </TableCell>
                <TableCell sx={CELL_STYLES}>
                    <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "#00E5A0" }}>{fmtDuration(job.executionLatency)}</Typography>
                    <Typography sx={{ mt: 0.3, fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>queue {fmtDuration(queueLatency)}</Typography>
                </TableCell>
                <TableCell sx={CELL_STYLES}>
                    <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{new Date(job.createdAt).toLocaleString()}</Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={9} sx={{ p: 0, borderBottom: open ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2.2, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(320px, 0.8fr) 1.2fr" }, gap: 2, background: "rgba(0,0,0,0.14)" }}>
                            <Box sx={{ p: 1.8, borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}>
                                <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1.5px", color: "rgba(255,255,255,0.36)", textTransform: "uppercase", mb: 1.2 }}>
                                    Execution Trace
                                </Typography>
                                <JobExecutionTimeline job={job} />
                            </Box>
                            <AiJobResultViewer job={job} />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
};

export default function JobsTable({ jobs }) {
    return (
        <Paper elevation={0} sx={{ overflow: "hidden", background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", backdropFilter: "blur(12px)" }}>
            <Box sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 1120 }}>
                <TableHead>
                    <TableRow sx={{ background: "rgba(255,255,255,0.02)" }}>
                        <TableCell sx={COL_STYLES} />
                        {["Execution ID", "Type / Capability", "Status", "Priority", "Model / Runtime", "AI Worker", "Inference / Queue", "Created"].map((h) => <TableCell key={h} sx={COL_STYLES}>{h}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {jobs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} sx={{ ...CELL_STYLES, textAlign: "center", py: 6 }}>
                                <Typography sx={{ fontSize: "11px", letterSpacing: "2px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>No executions found</Typography>
                            </TableCell>
                        </TableRow>
                    ) : jobs.map((job) => <JobRow key={job.id} job={job} />)}
                </TableBody>
            </Table>
            </Box>
        </Paper>
    );
}
