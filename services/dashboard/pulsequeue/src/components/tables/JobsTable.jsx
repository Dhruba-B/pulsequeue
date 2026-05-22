import {
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Box,
    alpha,
} from "@mui/material";
import StatusChip from "../common/StatusChip";

const COL_STYLES = {
    fontFamily: "'Space Mono', monospace",
    fontSize: "10px",
    letterSpacing: "2px",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    fontWeight: 700,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    py: "14px",
    px: "20px",
    whiteSpace: "nowrap",
};

const CELL_STYLES = {
    fontFamily: "'Space Mono', monospace",
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    py: "14px",
    px: "20px",
};

const PRIORITY_COLOR = {
    high: { color: "#FF4D6A", bg: alpha("#FF4D6A", 0.1) },
    medium: { color: "#FFB800", bg: alpha("#FFB800", 0.1) },
    low: { color: "#7B8CDE", bg: alpha("#7B8CDE", 0.1) },
};

const PriorityBadge = ({ priority }) => {
    const key = (priority || "").toLowerCase();
    const { color, bg } = PRIORITY_COLOR[key] || { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)" };
    return (
        <Box
            component="span"
            sx={{
                display: "inline-block",
                px: "8px",
                py: "3px",
                borderRadius: "6px",
                fontSize: "10px",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                fontWeight: 700,
                color,
                background: bg,
                border: `1px solid ${alpha(color, 0.25)}`,
            }}
        >
            {priority || "—"}
        </Box>
    );
};

export default function JobsTable({ jobs }) {
    return (
        <Paper
            elevation={0}
            sx={{
                overflow: "hidden",
                background: "rgba(255,255,255,0.028)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 4,
                backdropFilter: "blur(12px)",
            }}
        >
            <Table>
                <TableHead>
                    <TableRow sx={{ background: "rgba(255,255,255,0.02)" }}>
                        {["Job ID", "Type", "Status", "Priority", "Attempts", "Worker", "Created"].map((h) => (
                            <TableCell key={h} sx={COL_STYLES}>{h}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {jobs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} sx={{ ...CELL_STYLES, textAlign: "center", py: 6 }}>
                                <Typography sx={{ fontSize: "11px", letterSpacing: "2px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                                    No jobs found
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        jobs.map((job) => (
                            <TableRow
                                key={job.id}
                                sx={{
                                    transition: "background 0.15s ease",
                                    "&:hover": { background: "rgba(255,255,255,0.03)" },
                                    "&:last-child td": { borderBottom: "none" },
                                }}
                            >
                                {/* Job ID */}
                                <TableCell sx={CELL_STYLES}>
                                    <Box
                                        component="span"
                                        sx={{
                                            fontFamily: "'Space Mono', monospace",
                                            fontSize: "12px",
                                            color: "#00C8FF",
                                            background: alpha("#00C8FF", 0.08),
                                            border: `1px solid ${alpha("#00C8FF", 0.2)}`,
                                            borderRadius: "6px",
                                            px: "8px",
                                            py: "3px",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        {job.id.slice(0, 8)}
                                    </Box>
                                </TableCell>

                                {/* Type */}
                                <TableCell sx={CELL_STYLES}>
                                    <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                                        {job.type}
                                    </Typography>
                                </TableCell>

                                {/* Status */}
                                <TableCell sx={CELL_STYLES}>
                                    <StatusChip status={job.status} />
                                </TableCell>

                                {/* Priority */}
                                <TableCell sx={CELL_STYLES}>
                                    <PriorityBadge priority={job.priority} />
                                </TableCell>

                                {/* Attempts */}
                                <TableCell sx={CELL_STYLES}>
                                    <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                                        {job.attempts}
                                    </Typography>
                                </TableCell>

                                {/* Worker */}
                                <TableCell sx={CELL_STYLES}>
                                    <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                                        {job.workerId || "—"}
                                    </Typography>
                                </TableCell>

                                {/* Created */}
                                <TableCell sx={CELL_STYLES}>
                                    <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px" }}>
                                        {new Date(job.createdAt).toLocaleString()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
}