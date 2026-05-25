import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

export const fetchStats = async () => {

    const res =
        await API.get("/dashboard/stats");

    return res.data.data;
};

export const fetchJobs = async ({
    status,
    search,
    page = 1,
    limit = 20
}) => {

    const res = await API.get(
        "/dashboard/jobs",
        {
            params: {
                status,
                search,
                page,
                limit
            }
        }
    );

    return res.data;
};

export const createJob = async (job) => {

    const res =
        await API.post(
            "/jobs",
            job
        );

    return res.data.data;
};

export const fetchWorkers = async () => {

    const res =
        await API.get("/dashboard/workers");

    return res.data.data;
};

export const fetchWorkerControls = async () => {

    const res =
        await API.get("/workers");

    return res.data.data;
};

export const startWorker = async (count = 1) => {

    const res =
        await API.post(
            "/workers/start",
            { count }
        );

    return res.data.data;
};

export const stopWorker = async (workerId) => {

    const res =
        await API.post(`/workers/${workerId}/stop`);

    return res.data.data;
};

export const stopWorkers = async () => {

    const res =
        await API.post("/workers/stop");

    return res.data.data;
};
