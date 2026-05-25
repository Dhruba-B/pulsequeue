import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Chip,
    keyframes
} from "@mui/material";
import { useEffect, useState } from "react";

const livePulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.85); }
`;

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);

        return () => clearInterval(id);
    }, []);

    return (
        <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>
            {time.toLocaleTimeString("en-US", { hour12: false })}
        </Typography>
    );
};

export default function Topbar() {

    return (

        <AppBar
            position="fixed"
            elevation={0}

            sx={{

                width: {
                    xs: "100%",
                    md: "calc(100% - 260px)"
                },

                ml: {
                    xs: 0,
                    md: "260px"
                },

                background:
                    "rgba(8,11,16,0.75)",

                backdropFilter:
                    "blur(14px)",

                borderBottom:
                    "1px solid rgba(255,255,255,0.06)"
            }}
        >
            <Toolbar sx={{ px: { xs: 2.5, md: 5 }, justifyContent: "space-between" }}>
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontSize: 16
                    }}
                >
                    Distributed Queue Monitoring
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Chip
                        size="small"
                        icon={
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#00E5A0",
                                    boxShadow: "0 0 8px #00E5A0",
                                    animation: `${livePulse} 1.4s ease-in-out infinite`,
                                    ml: "12px !important",
                                }}
                            />
                        }
                        label="LIVE"
                        sx={{
                            background: "transparent",
                            border: "1px solid rgba(0,229,160,0.25)",
                            color: "#00E5A0",
                            fontSize: "10px",
                            letterSpacing: "1.5px",
                            height: 28,
                            "& .MuiChip-label": { px: 1.5 },
                        }}
                    />
                    <Clock />
                </Box>
            </Toolbar>

        </AppBar>
    );
}
