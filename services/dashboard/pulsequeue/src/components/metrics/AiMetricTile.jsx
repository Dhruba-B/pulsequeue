import { Box, Typography, alpha } from "@mui/material";

const MONO = "'Space Mono', monospace";

// AiMetricTile.jsx — add height lock and consistent internal layout
export default function AiMetricTile({ label, value, unit, accent, icon }) {
    return (
        <Box sx={{
            height: 96,                              // ← fixed height, all tiles match
            width: 300,
            p: "14px 14px 12px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: alpha(accent, 0.05),
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",         // ← icon row top, value bottom
        }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.34)", letterSpacing: "1.3px", textTransform: "uppercase" }}>
                    {label}
                </Typography>
                <Box sx={{ color: accent, opacity: 0.5, fontSize: 12, width: 20 }}>{icon}</Box>
            </Box>
            <Box>
                <Typography sx={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: accent, lineHeight: 1 }}>
                    {value}
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.28)", mt: 0.4, letterSpacing: "0.5px" }}>
                    {unit}
                </Typography>
            </Box>
        </Box>
    );
}
