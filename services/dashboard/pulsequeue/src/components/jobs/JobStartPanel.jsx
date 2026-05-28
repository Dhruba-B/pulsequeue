import { useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { BrainCircuit, Cpu, Play, SlidersHorizontal } from "lucide-react";

import AiPayloadEditor from "../ai/AiPayloadEditor";
import AiPayloadFields from "../ai/AiPayloadFields";
import { fieldSx, menuSx } from "../ai/aiFormStyles";
import {
    AI_JOB_TYPES,
    AI_MODEL_OPTIONS,
    JOB_TYPE_CONFIG,
    RUNTIME_OPTIONS,
    getDefaultExecution,
} from "../ai/aiExecutionConfig";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];

const formatPayload = (payload) => JSON.stringify(payload, null, 2);

const parsePayload = (payloadText) => JSON.parse(payloadText);

export default function JobStartPanel({
    onSubmit,
    submitting
}) {
    const [type, setType] = useState("SUMMARIZE");
    const [payload, setPayload] = useState(JOB_TYPE_CONFIG.SUMMARIZE.payload);
    const [payloadText, setPayloadText] = useState(formatPayload(JOB_TYPE_CONFIG.SUMMARIZE.payload));
    const [payloadError, setPayloadError] = useState("");
    const [priority, setPriority] = useState("HIGH");
    const [maxAttempts, setMaxAttempts] = useState(3);
    const [delayMs, setDelayMs] = useState(0);
    const [execution, setExecution] = useState(getDefaultExecution("SUMMARIZE"));

    const activeConfig = useMemo(() => JOB_TYPE_CONFIG[type], [type]);

    const handleTypeChange = (nextType) => {
        const nextPayload = JOB_TYPE_CONFIG[nextType].payload;

        setType(nextType);
        setPayload(nextPayload);
        setExecution(getDefaultExecution(nextType));
        setPayloadText(formatPayload(nextPayload));
        setPayloadError("");
    };

    const handlePayloadChange = (nextPayload) => {
        setPayload(nextPayload);
        setPayloadText(formatPayload(nextPayload));
        setPayloadError("");
    };

    const handlePayloadTextChange = (nextValue) => {
        setPayloadText(nextValue);

        try {
            const parsed = parsePayload(nextValue);
            setPayload(parsed);
            setPayloadError("");
        } catch {
            setPayloadError("invalid json");
        }
    };

    const handleExecutionChange = (patch) => {
        setExecution((prev) => ({
            ...prev,
            ...patch,
        }));
    };

    const handleSubmit = async () => {
        let parsedPayload;

        try {
            parsedPayload = parsePayload(payloadText);
            setPayloadError("");
        } catch {
            setPayloadError("invalid json");
            return;
        }

        const numericDelay = Number(delayMs || 0);

        await onSubmit({
            type,
            payload: parsedPayload,
            priority,
            maxAttempts: Number(maxAttempts),
            runAt: numericDelay > 0 ? Date.now() + numericDelay : null,
            execution: {
                ...execution,
                timeoutMs: Number(execution.timeoutMs || 0),
                delayMs: numericDelay,
            },
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
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background: "radial-gradient(ellipse 48% 74% at 100% 0%, rgba(0,200,255,0.08), transparent 58%)",
                }}
            />

            <Box sx={{ position: "relative", p: { xs: 2, md: 2.5 } }}>
                <Stack sx={{ mb: 2.5, flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between" }}>
                    <Stack sx={{ flexDirection: "row", gap: 1.4, alignItems: "center" }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#00C8FF",
                                background: alpha("#00C8FF", 0.1),
                                border: `1px solid ${alpha("#00C8FF", 0.24)}`,
                            }}
                        >
                            <BrainCircuit size={19} />
                        </Box>

                        <Box>
                            <Typography sx={{ fontFamily: SYNE, fontSize: "17px", fontWeight: 800, color: "#fff", textAlign: "left" }}>
                                Submit AI Execution
                            </Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "1.8px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                                capability routed distributed inference
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>

                <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField select fullWidth label="EXECUTION TYPE" value={type} onChange={(event) => handleTypeChange(event.target.value)} sx={fieldSx} slotProps={{ select: { MenuProps: menuSx } }}>
                            {AI_JOB_TYPES.map((jobType) => (
                                <MenuItem key={jobType} value={jobType}>{jobType}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField select fullWidth label="MODEL / ENGINE" value={execution.model} onChange={(event) => handleExecutionChange({ model: event.target.value })} sx={fieldSx} slotProps={{ select: { MenuProps: menuSx } }}>
                            {AI_MODEL_OPTIONS[type].map((model) => (
                                <MenuItem key={model} value={model}>{model}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField select fullWidth label="RUNTIME" value={execution.runtime} onChange={(event) => handleExecutionChange({ runtime: event.target.value })} sx={fieldSx} slotProps={{ select: { MenuProps: menuSx } }}>
                            {RUNTIME_OPTIONS[type].map((runtime) => (
                                <MenuItem key={runtime} value={runtime}>{runtime}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField select fullWidth label="PRIORITY" value={priority} onChange={(event) => setPriority(event.target.value)} sx={fieldSx} slotProps={{ select: { MenuProps: menuSx } }}>
                            {PRIORITIES.map((item) => (
                                <MenuItem key={item} value={item}>{item}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1.5, width: "100%" }}>
                        <Box sx={{ p: 1.4, flex: 1, borderRadius: "14px", background: alpha("#00C8FF", 0.045), border: `1px solid ${alpha("#00C8FF", 0.12)}` }}>
                            <Stack sx={{ flexDirection: "row", gap: 1, alignItems: "center", mb: 1.3 }}>
                                <Cpu size={14} color="#00C8FF" />
                                <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1.5px", color: "#00C8FF", textTransform: "uppercase" }}>
                                    {activeConfig.capability} capability
                                </Typography>
                                <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.42)" }}>
                                    {activeConfig.description}
                                </Typography>
                            </Stack>
                            <AiPayloadFields type={type} payload={payload} onChange={handlePayloadChange} />
                        </Box>
                        <Grid size={{ xs: 12 }} sx={{ p: 0, borderRadius: "14px", flex: 1, background: alpha("#FF4D6A", 0.045), border: `1px solid ${alpha("#FF4D6A", 0.12)}` }}>
                            <AiPayloadEditor
                                label={`payload json / ${type}`}
                                value={payloadText}
                                onChange={handlePayloadTextChange}
                                error={payloadError}
                            />
                        </Grid>
                    </Box>



                    <Grid size={{ xs: 12 }}>
                        <Accordion
                            disableGutters
                            elevation={0}
                            sx={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: "14px !important",
                                overflow: "hidden",
                                "&:before": { display: "none" },
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "rgba(255,255,255,0.45)" }} />}>
                                <Stack sx={{ flexDirection: "row", gap: 1, alignItems: "center" }}>
                                    <SlidersHorizontal size={15} color="#7B8CDE" />
                                    <Typography sx={{ fontFamily: MONO, fontSize: 11, letterSpacing: "1.5px", color: "rgba(255,255,255,0.52)", textTransform: "uppercase" }}>
                                        Advanced execution metadata
                                    </Typography>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField fullWidth label="RETRIES" type="number" value={maxAttempts} onChange={(event) => setMaxAttempts(event.target.value)} slotProps={{ htmlInput: { min: 1, max: 10 } }} sx={fieldSx} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField fullWidth label="DELAY MS" type="number" value={delayMs} onChange={(event) => setDelayMs(event.target.value)} slotProps={{ htmlInput: { min: 0 } }} sx={fieldSx} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField fullWidth label="TIMEOUT MS" type="number" value={execution.timeoutMs} onChange={(event) => handleExecutionChange({ timeoutMs: event.target.value })} slotProps={{ htmlInput: { min: 1000 } }} sx={fieldSx} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField fullWidth label="WORKER AFFINITY" value={execution.workerAffinity} onChange={(event) => handleExecutionChange({ workerAffinity: event.target.value })} placeholder="worker id or pool" sx={fieldSx} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField fullWidth label="PREFERRED CAPABILITY" value={execution.preferredCapability} onChange={(event) => handleExecutionChange({ preferredCapability: event.target.value })} sx={fieldSx} />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>

                <Button
                    disabled={submitting || Boolean(payloadError)}
                    onClick={handleSubmit}
                    startIcon={submitting ? <CircularProgress size={15} /> : <Play size={15} />}
                    sx={{
                        mt: 2,
                        minHeight: 42,
                        px: 2.2,
                        borderRadius: "12px",
                        fontFamily: MONO,
                        fontSize: "11px",
                        letterSpacing: "1px",
                        color: "#080B10",
                        background: "linear-gradient(135deg, #00C8FF, #00E5A0)",
                        boxShadow: "0 0 22px rgba(0,200,255,0.18)",
                        "&:hover": { boxShadow: "0 0 30px rgba(0,229,160,0.22)" },
                        "&.Mui-disabled": {
                            color: "rgba(255,255,255,0.28)",
                            background: "rgba(255,255,255,0.08)",
                        },
                    }}
                >
                    Dispatch Execution
                </Button>
            </Box>
        </Paper>
    );
}
