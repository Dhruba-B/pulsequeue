import express from "express";
import cors from "cors";

import jobRoutes from "./routes/jobRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/jobs", jobRoutes);

app.listen(5000, () => {
    console.log("API Server Running");
});