import { useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    alpha
} from "@mui/material";
import { Play, Braces, TimerReset } from "lucide-react";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const JOB_TYPES = [
    {
        value: "EMAIL",
        label: "EMAIL",
        payload: {
            to: "someone@xyz.com"
        }
    },
    {
        value: "IMAGE_PROCESS",
        label: "IMAGE_PROCESS",
        payload: {
            imageUrl: "https://example.com/image.png"
        }
    },
    {
        value: "REPORT_GENERATION",
        label: "REPORT_GENERATION",
        payload: {
            reportId: "monthly-ops",
            format: "pdf"
        }
    }
];

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        fontFamily: MONO,
        fontSize: "12px",
        color: "rgba(255,255,255,0.78)",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
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
    },
    "& .MuiInputLabel-root": {
        fontFamily: MONO,
        fontSize: "11px",
        color: "rgba(255,255,255,0.32)",
        letterSpacing: "1px",
    },
    "& .MuiSelect-icon": {
        color: "rgba(255,255,255,0.32)",
    },
};

const menuSx = {
    PaperProps: {
        sx: {
            background: "#0E1420",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            mt: 1,
            "& .MuiMenuItem-root": {
                fontFamily: MONO,
                fontSize: "12px",
                color: "rgba(255,255,255,0.62)",
            },
        },
    },
};

const formatPayload = (payload) =>
    JSON.stringify(payload, null, 2);

export default function JobStartPanel({
    onSubmit,
    submitting
}) {
    const [type, setType] = useState("EMAIL");
    const [priority, setPriority] = useState("HIGH");
    const [maxAttempts, setMaxAttempts] = useState(3);
    const [runAt, setRunAt] = useState("");
    const [payloadText, setPayloadText] = useState(
        formatPayload(JOB_TYPES[0].payload)
    );
    const [payloadError, setPayloadError] = useState("");

    const activeJobType = useMemo(
        () => JOB_TYPES.find((jobType) => jobType.value === type),
        [type]
    );

    const handleTypeChange = (nextType) => {
        const nextJobType = JOB_TYPES.find((jobType) => jobType.value === nextType);

        setType(nextType);
        setPayloadText(formatPayload(nextJobType.payload));
        setPayloadError("");
    };

    const handleSubmit = async () => {
        let payload;

        try {
            payload = JSON.parse(payloadText);
            setPayloadError("");
        } catch {
            setPayloadError("Payload must be valid JSON");
            return;
        }

        await onSubmit({
            type,
            payload,
            priority,
            maxAttempts: Number(maxAttempts),
            runAt: runAt
                ? new Date(runAt).getTime()
                : null,
        });
    };

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
                mb: 4,
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background: "radial-gradient(ellipse 45% 70% at 100% 0%, rgba(0,200,255,0.07), transparent 58%)",
                }}
            />

            <Box sx={{ position: "relative", p: { xs: 2, md: 2.5 } }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "stretch", md: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 2.5 }}
                >
                    <Stack direction="row" spacing={1.4} alignItems="center">
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#00C8FF",
                                background: alpha("#00C8FF", 0.1),
                                border: `1px solid ${alpha("#00C8FF", 0.24)}`,
                                textAlign: "left",
                            }}
                        >
                            <Braces size={18} />
                        </Box>

                        <Box>
                            <Typography sx={{ fontFamily: SYNE, fontSize: "16px", fontWeight: 800, color: "#fff" ,textAlign: "left"}}>
                                Start Job
                            </Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "1.8px", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                                enqueue through existing API
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>

                <Grid container spacing={1.5}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="TYPE"
                            value={type}
                            onChange={(event) => handleTypeChange(event.target.value)}
                            sx={{ ...fieldSx, width: 150 }}
                            SelectProps={{ MenuProps: menuSx }}
                        >
                            {JOB_TYPES.map((jobType) => (
                                <MenuItem key={jobType.value} value={jobType.value}>
                                    {jobType.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="PRIORITY"
                            value={priority}
                            onChange={(event) => setPriority(event.target.value)}
                            sx={{ ...fieldSx, width: 120 }}
                            SelectProps={{ MenuProps: menuSx }}
                        >
                            {PRIORITIES.map((item) => (
                                <MenuItem key={item} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="ATTEMPTS"
                            type="number"
                            value={maxAttempts}
                            onChange={(event) => setMaxAttempts(event.target.value)}
                            inputProps={{ min: 1, max: 10 }}
                            sx={fieldSx}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="RUN AT"
                            type="datetime-local"
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            value={runAt}
                            onChange={(event) => setRunAt(event.target.value)}
                            sx={fieldSx}
                            InputProps={{
                                startAdornment: (
                                    <TimerReset size={14} color="rgba(255,255,255,0.28)" />
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={7}
                            label={`PAYLOAD JSON / ${activeJobType.label}`}
                            value={payloadText}
                            onChange={(event) => setPayloadText(event.target.value)}
                            error={Boolean(payloadError)}
                            helperText={payloadError || " "}
                            sx={{
                                ...fieldSx,
                                "& .MuiInputBase-input": {
                                    fontFamily: MONO,
                                    lineHeight: 1.55,
                                },
                                "& .MuiFormHelperText-root": {
                                    fontFamily: MONO,
                                    color: payloadError ? "#FF4D6A" : "rgba(255,255,255,0.18)",
                                },
                            }}
                        />
                    </Grid>

                </Grid>
                <Button
                    disabled={submitting}
                    onClick={handleSubmit}
                    startIcon={submitting ? <CircularProgress size={15} /> : <Play size={15} />}
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

                    }}
                >
                    Enqueue Job
                </Button>
            </Box>
        </Paper>
    );
}
