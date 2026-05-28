import { Box, Stack } from "@mui/material";
import { alpha } from "@mui/material";

const MONO = "'Space Mono', monospace";

const CAPABILITY_META = {
    SUMMARIZE: { color: "#00C8FF", icon: "≡" },
    TRANSLATE: { color: "#7B8CDE", icon: "⇄" },
    CLASSIFY: { color: "#FFB800", icon: "◈" },
    OCR: { color: "#00E5A0", icon: "⊡" },
    EMBED: { color: "#FF4D6A", icon: "⬡" },
};

export default function CapabilityPills({ capabilities = [] }) {
    return (
        <Stack
            sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "6px",
                alignItems: "center",
            }}
        >
            {capabilities.map((capability) => {
                const { color = "#00C8FF", icon = "·" } = CAPABILITY_META[capability] || {};

                return (
                    <Box
                        key={capability}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            px: "10px",
                            py: "5px",
                            borderRadius: "6px",
                            border: `1px solid ${alpha(color, 0.22)}`,
                            background: alpha(color, 0.07),
                            cursor: "default",
                            transition: "background 0.15s ease, border-color 0.15s ease",
                            "&:hover": {
                                background: alpha(color, 0.14),
                                borderColor: alpha(color, 0.42),
                            },
                        }}
                    >
                        {/* color dot */}
                        <Box
                            sx={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: color,
                                flexShrink: 0,
                                boxShadow: `0 0 5px ${alpha(color, 0.7)}`,
                            }}
                        />
                        <Box
                            component="span"
                            sx={{
                                fontFamily: MONO,
                                fontSize: "10px",
                                fontWeight: 600,
                                letterSpacing: "0.9px",
                                color,
                                lineHeight: 1,
                            }}
                        >
                            {capability}
                        </Box>
                    </Box>
                );
            })}
        </Stack>
    );
}