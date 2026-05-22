import { Chip } from "@mui/material";

const STATUS_CONFIG = {
    WAITING: {
        color: "#FFB800",
    },

    ACTIVE: {
        color: "#00C8FF",
    },

    COMPLETED: {
        color: "#00E5A0",
    },

    FAILED: {
        color: "#FF4D6A",
    },

    DELAYED: {
        color: "#7B8CDE",
    },
};

export default function StatusChip({ status }) {
    const config = STATUS_CONFIG[status];

    return (
        <Chip
            label={status}
            size="small"
            sx={{
                background: `${config.color}15`,
                fontSize: "10px",
                color: config.color,
                border: `1px solid ${config.color}50`,
                letterSpacing: "1px",
            }}
        />
    );
}
