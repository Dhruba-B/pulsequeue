import { useCallback, useEffect, useState } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { fetchWorkers } from "../api/dashboardApi";
import socket from "../hooks/useSocket";
import SectionHeader from "../components/common/SectionHeader";
import WorkerCard from "../components/workers/WorkerCard";
import WorkerDetailDrawer from "../components/workers/WorkerDetailDrawer";

const MONO = "'Space Mono', monospace";

export default function WorkersPage() {
    const [workers, setWorkers] = useState([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState(null);

    const loadWorkers = useCallback(async () => {
        const res = await fetchWorkers();
        setWorkers(res);
    }, []);

    useEffect(() => {
        queueMicrotask(loadWorkers);
        const interval = setInterval(loadWorkers, 10000);

        socket.on("worker_updated", loadWorkers);
        socket.on("job_started", loadWorkers);
        socket.on("job_completed", loadWorkers);
        socket.on("job_failed", loadWorkers);

        return () => {
            clearInterval(interval);
            socket.off("worker_updated", loadWorkers);
            socket.off("job_started", loadWorkers);
            socket.off("job_completed", loadWorkers);
            socket.off("job_failed", loadWorkers);
        };
    }, [loadWorkers]);

    const selectedWorker = workers.find((worker) => worker.workerId === selectedWorkerId) || null;
    const online = workers.filter((worker) => worker.isAlive).length;
    const executing = workers.filter((worker) => worker.currentJob).length;

    return (
        <Box sx={{ minHeight: "100vh" }}>
            <SectionHeader
                title="AI Workers"
                eyebrow="Realtime inference cluster monitoring"
                action={(
                    <Stack sx={{ flexDirection: "row", gap: 1.5 }}>
                        {[
                            ["Online", online, "#00E5A0"],
                            ["Executing", executing, "#00C8FF"],
                            ["Total", workers.length, "#7B8CDE"],
                        ].map(([label, value, color]) => (
                            <Box key={label} sx={{ px: 1.4, py: 0.9, borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                                <Typography sx={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "1.3px", textTransform: "uppercase" }}>{label}</Typography>
                                <Typography sx={{ mt: 0.3, fontFamily: MONO, fontSize: 15, color }}>{value}</Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            />

            <Grid container spacing={2.2}>
                {workers.map((worker) => (
                    <Grid item xs={12} lg={6} xl={4} key={worker.workerId}>
                        <WorkerCard worker={worker} onClick={() => setSelectedWorkerId(worker.workerId)} />
                    </Grid>
                ))}
                {workers.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ p: 6, textAlign: "center", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", background: "rgba(255,255,255,0.03)" }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                                No AI workers have advertised capabilities yet
                            </Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            <WorkerDetailDrawer
                worker={selectedWorker}
                open={Boolean(selectedWorker)}
                onClose={() => setSelectedWorkerId(null)}
            />
        </Box>
    );
}
