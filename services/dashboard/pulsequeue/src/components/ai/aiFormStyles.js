const MONO = "'Space Mono', monospace";

export const fieldSx = {
    "& .MuiOutlinedInput-root": {
        fontFamily: MONO,
        fontSize: "12px",
        color: "rgba(255,255,255,0.78)",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.15)" },
        "&.Mui-focused fieldset": { borderColor: "#00C8FF", borderWidth: "1px" },
    },
    "& .MuiInputLabel-root": {
        fontFamily: MONO,
        fontSize: "11px",
        color: "rgba(255,255,255,0.32)",
        letterSpacing: "1px",
    },
    "& .MuiSelect-icon": { color: "rgba(255,255,255,0.32)" },
};

export const menuSx = {
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
