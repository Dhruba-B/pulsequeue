import { useEffect, useState } from "react";

import { Box, Grid, Typography, Stack } from "@mui/material";

import { fetchWorkers } from "../api/dashboardApi";

import WorkerCard from "../components/workers/WorkerCard";

export default function WorkersPage() {
    const [workers, setWorkers] = useState([]);

    const loadWorkers = async () => {
        const res = await fetchWorkers();

        setWorkers(res);
    };

    useEffect(() => {
        loadWorkers();

        const interval = setInterval(loadWorkers, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box
            sx={{
                minHeight: "100vh",
            }}
        >
            {/* Header */}

            <Box mb={5}>
                <Typography
                    sx={{
                        fontFamily: "'Syne', sans-serif",

                        fontSize: {
                            xs: "28px",
                            md: "34px",
                        },

                        fontWeight: 800,

                        background: "linear-gradient(90deg,#fff,rgba(255,255,255,0.45))",

                        WebkitBackgroundClip: "text",

                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Workers
                </Typography>

                <Typography
                    sx={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.5)",
                        mb: 2,
                    }}
                >
                    DISTRIBUTED WORKER NODES
                </Typography>
            </Box>

            {/* Grid */}

            <Grid container spacing={3}>
                {workers.map((worker) => (
                    <Grid item xs={12} md={6} lg={4} key={worker.workerId}>
                        <WorkerCard worker={worker} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
