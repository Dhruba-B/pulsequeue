import { Box, Stack, Typography, alpha } from "@mui/material";
import { CheckCircle2, TriangleAlert } from "lucide-react";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

// Shared text style constants — must be identical on both the <pre> and <textarea>
const SHARED_TEXT_SX = {
    fontFamily: SYNE,
    fontSize: "12px",        // explicit px, not a theme token, so both layers agree
    lineHeight: "1.65",
    whiteSpace: "pre",
    tabSize: 4,
    // Do NOT put overflowWrap / wordBreak here — they affect layout and cause drift
    // "pre" whitespace already prevents wrapping
    letterSpacing: "normal",
    fontVariantLigatures: "none",
    fontFeatureSettings: "normal",
    fontWeight: 400,
    textAlign: "left",
    // Identical padding
    p: 1.6,
    // Identical box model
    boxSizing: "border-box",
    m: 0,
};

const escapeHtml = (value) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

const highlightJson = (value) =>
    escapeHtml(value)
        .replace(/("[^"]+":)/g, '<span class="json-key">$1</span>')
        .replace(/(:\s*)("[^"]*")/g, '$1<span class="json-string">$2</span>')
        .replace(
            /(:\s*)(true|false|null|\d+(?:\.\d+)?)/g,
            '$1<span class="json-value">$2</span>'
        );

export default function AiPayloadEditor({ label, value, onChange, error }) {
    const highlighted = error ? "" : highlightJson(value);

    return (
        <Box
            sx={{
                borderRadius: "14px",
                overflow: "hidden",
                border: `1px solid ${error ? alpha("#FF4D6A", 0.45) : "rgba(255,255,255,0.08)"
                    }`,
                background: "rgba(0,0,0,0.28)",
            }}
        >
            {/* Header */}
            <Stack
                sx={{
                    px: 1.5,
                    py: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.025)",
                }}
            >
                <Typography
                    sx={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: "1.4px",
                        color: "rgba(255,255,255,0.42)",
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </Typography>
                <Stack
                    sx={{
                        flexDirection: "row",
                        gap: 0.7,
                        alignItems: "center",
                        color: error ? "#FF4D6A" : "#00E5A0",
                    }}
                >
                    {error ? <TriangleAlert size={13} /> : <CheckCircle2 size={13} />}
                    <Typography sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1px" }}>
                        {error || "valid json"}
                    </Typography>
                </Stack>
            </Stack>

            {/*
             * The overlay trick:
             * Both <pre> and <textarea> sit in the same CSS grid cell so they
             * always occupy exactly the same bounding box. Every property that
             * influences text layout MUST be shared (font, size, line-height,
             * padding, box-sizing, white-space, tab-size).
             *
             * The textarea text is transparent so the <pre> highlights show
             * through, but the caret is still drawn by the textarea at the
             * correct position because the layout is identical.
             */}
            <Box
                sx={{
                    display: "grid",
                    background: error ? "rgba(255,77,106,0.035)" : "transparent",
                    // Allow vertical resize on the grid container itself
                    resize: "vertical",
                    overflow: "auto",
                    minHeight: 250,
                }}
            >
                {/* Highlight layer */}
                {!error && (
                    <Box
                        component="pre"
                        aria-hidden
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                        sx={{
                            ...SHARED_TEXT_SX,
                            // Sit in grid cell 1/1
                            gridArea: "1 / 1",
                            pointerEvents: "none",
                            color: "rgba(255,255,255,0.62)",
                            overflow: "hidden",   // pre must NOT scroll independently
                            minHeight: 0,
                            "& .json-key": { color: "#00C8FF" },
                            "& .json-string": { color: "#00E5A0" },
                            "& .json-value": { color: "#FFB800" },
                        }}
                    />
                )}

                {/* Editable layer — transparent text, visible caret */}
                <Box
                    component="textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    spellCheck={false}
                    sx={{
                        ...SHARED_TEXT_SX,
                        // Sit in the same grid cell, on top
                        gridArea: "1 / 1",
                        // Fill the grid cell
                        width: "100%",
                        height: "100%",
                        minHeight: 250,
                        display: "block",
                        // No independent resize — the grid container handles it
                        resize: "none",
                        border: 0,
                        outline: 0,
                        // Transparent text so highlight layer shows through;
                        // caret remains visible
                        color: error ? "rgba(255,255,255,0.76)" : "transparent",
                        caretColor: "#fff",
                        background: "transparent",
                        // Scrollbar must be on the textarea so it scrolls with typing
                        overflow: "auto",
                        // Critical: no extra height from default textarea appearance
                        verticalAlign: "top",
                    }}
                />
            </Box>
        </Box>
    );
}