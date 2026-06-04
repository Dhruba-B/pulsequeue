import express from "express";
import cors from "cors";
import jobRoutes from "./routes/jobRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import { startEventSubscriber } from "./services/eventSubscriber.js";
import { hydrateManagedWorkers } from "./services/workerManager.js";

import { Server } from "socket.io";
import http from "http";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/healthz", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "api-server",
    });
});

app.use("/jobs", jobRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/workers", workerRoutes);

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {

    console.log(
        "Dashboard Connected:",
        socket.id
    );
});

const PORT = 5000;

await hydrateManagedWorkers();

startEventSubscriber();

server.listen(5000, () => {
    console.log("API Server Running");
});
