import {
    Box,
    Stack,
    Typography
} from "@mui/material";

import {
    NavLink
} from "react-router-dom";

import {
    NAV_ITEMS
} from "../../utils/navigationConfig";
import BoltIcon from "@mui/icons-material/Bolt";


export default function Sidebar() {

    return (

        <Box
            sx={{

                width: 260,

                height: "100vh",

                position: "fixed",

                top: 0,
                left: 0,

                px: 2,
                py: 3,

                background:
                    "rgba(8,11,16,0.96)",

                borderRight:
                    "1px solid rgba(255,255,255,0.06)",

                backdropFilter:
                    "blur(14px)",

                zIndex: 1200
                ,
                display: {
                    xs: "none",
                    md: "block"
                }
            }}
        >

            {/* Logo */}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, mb: 4 }}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 99,
                        background: "linear-gradient(135deg, #00C8FF, #00E5A0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 18px rgba(0,200,255,0.4)",
                    }}
                >
                    <BoltIcon sx={{ fontSize: 18, color: "#080B10" }} />
                </Box>
                <Typography
                    sx={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "22px",
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                        background: "linear-gradient(90deg, #fff 30%, #00C8FF)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    PulseQueue
                </Typography>
            </Box>

            {/* Navigation */}

            <Stack sx={{ gap: 1 }}>

                {NAV_ITEMS.map((item) => {

                    const Icon = item.icon;

                    return (

                        <NavLink
                            key={item.path}
                            to={item.path}

                            style={{
                                textDecoration: "none"
                            }}
                        >

                            {({ isActive }) => (

                                <Box
                                    sx={{

                                        display: "flex",

                                        alignItems: "center",

                                        gap: 1.5,

                                        px: 2,
                                        py: 1.5,

                                        borderRadius: 2,

                                        color: isActive
                                            ? "#FFFFFF"
                                            : "rgba(255,255,255,0.65)",

                                        background: isActive
                                            ? "rgba(0,200,255,0.12)"
                                            : "transparent",

                                        border: isActive
                                            ? "1px solid rgba(0,200,255,0.22)"
                                            : "1px solid transparent",

                                        transition:
                                            "all 0.2s ease",

                                        "&:hover": {

                                            background:
                                                "rgba(255,255,255,0.04)",

                                            color: "#FFFFFF"
                                        }
                                    }}
                                >

                                    <Icon size={18} />

                                    <Typography
                                        sx={{
                                            fontSize: 14,
                                            fontWeight: 600
                                        }}
                                    >
                                        {item.label}
                                    </Typography>

                                </Box>
                            )}

                        </NavLink>
                    );
                })}

            </Stack>

        </Box>
    );
}
