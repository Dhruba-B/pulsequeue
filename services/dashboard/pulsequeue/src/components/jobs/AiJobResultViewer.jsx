import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, Typography, alpha } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

const JsonBlock = ({ value }) => (
    <Box
        component="pre"
        sx={{
            m: 0,
            p: 1.5,
            borderRadius: "10px",
            overflow: "auto",
            maxHeight: 260,
            background: "rgba(0,0,0,0.24)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.72)",
            fontFamily: MONO,
            fontSize: 11,
            lineHeight: 1.55,
            textWrap: "wrap",
        }}
    >
        {JSON.stringify(value, null, 2)}
    </Box>
);

const TextCard = ({ title, text, accent = "#00C8FF" }) => (
    <Box sx={{ p: 1.5, borderRadius: "12px", background: alpha(accent, 0.06), border: `1px solid ${alpha(accent, 0.18)}` }}>
        <Typography sx={{ fontFamily: MONO, fontSize: 10, color: accent, letterSpacing: "1.5px", textTransform: "uppercase", mb: 1 }}>
            {title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {text || "No textual output stored."}
        </Typography>
    </Box>
);

const MetadataChips = ({ items }) => (
    <Stack sx={{ flexDirection: "row", gap: 1, flexWrap: "wrap" }}>
        {items.filter(([, value]) => value != null && value !== "").map(([label, value]) => (
            <Chip key={label} label={`${label}: ${value}`} sx={{ color: "#00E5A0", background: alpha("#00E5A0", 0.08), border: `1px solid ${alpha("#00E5A0", 0.2)}`, fontFamily: MONO, fontSize: 11 }} />
        ))}
    </Stack>
);

const EmbeddingCard = ({ result = {}, job }) => {
    const embedding = result.embedding || [];
    const dimensions = embedding.length;
    const magnitude = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0));
    const min = dimensions ? Math.min(...embedding) : 0;
    const max = dimensions ? Math.max(...embedding) : 0;
    const mean = dimensions
        ? embedding.reduce((sum, value) => sum + value, 0) / dimensions
        : 0;

    return (
        <Stack sx={{ gap: 1.5 }}>
            <MetadataChips
                items={[
                    ["Dimensions", dimensions],
                    ["Magnitude", magnitude.toFixed(3)],
                    ["Mean", mean.toFixed(4)],
                    ["Min", min.toFixed(3)],
                    ["Max", max.toFixed(3)],
                    ["Model", result.model || job.execution?.model],
                    ["Inference", job.executionLatency ? `${job.executionLatency}ms` : null],
                ]}
            />
            <JsonBlock value={{ dimensions, stats: { magnitude, mean, min, max }, model: result.model || job.execution?.model, vectorPreviewSuppressed: true }} />
        </Stack>
    );
};

const ClassificationCard = ({ result }) => {
    const labels = result.labels || (result.label ? [{ label: result.label, confidence: result.confidence ?? 1 }] : []);

    return (
        <Stack sx={{ gap: 1 }}>
            {labels?.map((item) => {
                const confidence = Math.round((item.confidence ?? 1) * 100);
                return (
                    <Box key={item.label} sx={{ p: 1.2, borderRadius: "10px", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <Stack sx={{ mb: 0.8, flexDirection: "row", justifyContent: "space-between" }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: 12, color: "#FFB800" }}>{item.label}</Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{confidence}%</Typography>
                        </Stack>
                        <Box sx={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <Box sx={{ width: `${confidence}%`, height: "100%", background: "#FFB800", boxShadow: `0 0 12px ${alpha("#FFB800", 0.55)}` }} />
                        </Box>
                    </Box>
                );
            })}
        </Stack>
    );
};

const StructuredResult = ({ job }) => {
    const result = job.result || {};

    if (job.type === "SUMMARIZE") return <TextCard title="Summary" text={result.summary} />;
    if (job.type === "OCR") return <TextCard title="Extracted Text" text={result.text} accent="#00E5A0" />;
    if (job.type === "TRANSLATE") return <TextCard title="Translated Text" text={result.translated} accent="#7B8CDE" />;
    if (job.type === "EMBED") return <EmbeddingCard result={result} job={job} />;
    if (job.type === "CLASSIFY") return <ClassificationCard result={result} />;

    return <JsonBlock value={result} />;
};

export default function AiJobResultViewer({ job }) {
    if (!job?.result) {
        return (
            <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "1px", textTransform: "uppercase" }}>
                No execution output persisted yet
            </Typography>
        );
    }

    return (
        <Accordion
            disableGutters
            defaultExpanded
            elevation={0}
            sx={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px !important",
                overflow: "hidden",
                "&:before": { display: "none" },
            }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "rgba(255,255,255,0.45)" }} />}>
                <Typography sx={{ fontFamily: SYNE, fontWeight: 800, fontSize: 14, color: "#fff" }}>
                    AI Result
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack sx={{ gap: 1.5 }}>
                    <StructuredResult job={job} />
                    {job.type !== "EMBED" && <JsonBlock value={job.result} />}
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}
