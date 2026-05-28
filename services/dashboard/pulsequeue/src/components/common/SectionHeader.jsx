import { Box, Typography } from "@mui/material";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";

export default function SectionHeader({ title, eyebrow, action }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
            }}
        >
            <Box>
                <Typography
                    sx={{
                        fontFamily: SYNE,
                        fontSize: { xs: 28, md: 36 },
                        fontWeight: 800,
                        lineHeight: 1,
                        color: "#fff",
                    }}
                >
                    {title}
                </Typography>
                {eyebrow && (
                    <Typography
                        sx={{
                            mt: 1,
                            fontFamily: MONO,
                            fontSize: 11,
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.42)",
                        }}
                    >
                        {eyebrow}
                    </Typography>
                )}
            </Box>
            {action}
        </Box>
    );
}
