import { Box, Grid, Paper, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const MONO = "'Space Mono', monospace";
const SYNE = "'Syne', sans-serif";
const COLORS = ["#00C8FF", "#00E5A0", "#FFB800", "#FF4D6A", "#7B8CDE"];

const ChartShell = ({ title, children }) => (
    <Paper elevation={0} sx={{ height: 300, p: 2, borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
        <Typography sx={{ fontFamily: SYNE, fontSize: 15, fontWeight: 800, color: "#fff", mb: 2 }}>{title}</Typography>
        {children}
    </Paper>
);

const tooltipStyle = {
    background: "#0E1420",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#fff",
    fontFamily: MONO,
    fontSize: 11,
};

export default function AiExecutionCharts({ metrics = {} }) {
    return (
        <Grid container spacing={2} >
            <Grid item xs={12} md={6} sx={{ width: 300 }}>
                <ChartShell title="Execution Distribution">
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie data={metrics.jobDistribution || []} dataKey="count" nameKey="type" innerRadius={58} outerRadius={96} paddingAngle={3}>
                                {(metrics.jobDistribution || []).map((entry, index) => <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartShell>
            </Grid>
            <Grid item xs={12} md={6} sx={{ width: 300 }}>
                <ChartShell title="Worker Distribution">
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={metrics.workerDistribution || []}>
                            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="type" stroke="rgba(255,255,255,0.35)" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: MONO }} />
                            <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: MONO }} allowDecimals={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#dbeb00">
                                {(metrics.workerDistribution || []).map((entry, index) => <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartShell>
            </Grid>
            <Grid item xs={12} md={6} sx={{ width: 300 }}>
                <ChartShell title="Execution Backlog">
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={metrics.queueDepth || []}>
                            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="queue" stroke="rgba(255,255,255,0.35)" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: MONO }} />
                            <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: MONO }} allowDecimals={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="depth" fill="#00C8FF" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartShell>
            </Grid>
            <Grid item xs={12} md={6} sx={{ width: 300 }}>
                <ChartShell title="Latency Histogram">
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={metrics.latencyHistogram || []}>
                            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="range" stroke="rgba(255,255,255,0.35)" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: MONO }} />
                            <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: MONO }} allowDecimals={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="count" fill="#FF4D6A" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartShell>
            </Grid>
            <Grid item xs={12} sx={{ width: 300 }}>
                <ChartShell title="Worker Utilization">
                    <Box sx={{ height: "85%" }} >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.utilizationByWorker || []}>
                                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                                <XAxis dataKey="workerId" stroke="rgba(255,255,255,0.35)" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: MONO }} />
                                <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: MONO }} domain={[0, 100]} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="utilization" fill="#00E5A0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </ChartShell>
            </Grid>
        </Grid>
    );
}
