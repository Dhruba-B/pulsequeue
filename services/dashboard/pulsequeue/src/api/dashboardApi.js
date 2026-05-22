import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000"
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

export const fetchWorkers = async () => {

    const res =
        await API.get("/dashboard/workers");

    return res.data.data;
};