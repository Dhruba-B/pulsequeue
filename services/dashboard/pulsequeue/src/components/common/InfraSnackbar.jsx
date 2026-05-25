import { Alert, Snackbar } from "@mui/material";

export default function InfraSnackbar({
    open,
    message,
    severity = "info",
    onClose
}) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={3200}
            onClose={onClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="outlined"
                sx={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "12px",
                    color: "#fff",
                    background: "rgba(8,11,16,0.94)",
                    borderColor: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(16px)",
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
