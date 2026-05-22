import { create } from "zustand";

export const useDashboardStore = create((set) => ({

    stats: null,

    jobs: [],

    workers: [],

    setStats: (stats) =>
        set({ stats }),

    setJobs: (jobs) =>
        set({ jobs }),

    setWorkers: (workers) =>
        set({ workers }),
}));