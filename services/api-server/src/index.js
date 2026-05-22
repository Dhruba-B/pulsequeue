import express from "express";
import cors from "cors";
import jobRoutes from "./routes/jobRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { startEventSubscriber } from "./services/eventSubscriber.js";

import { Server } from "socket.io";
import http from "http";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/jobs", jobRoutes);
app.use("/dashboard", dashboardRoutes);

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

startEventSubscriber();

server.listen(5000, () => {
    console.log("API Server Running");
});