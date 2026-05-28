import {
    LayoutDashboard,
    ListTodo,
    Cpu,
    SlidersHorizontal
} from "lucide-react";

export const NAV_ITEMS = [

    {
        label: "Overview",
        icon: LayoutDashboard,
        path: "/"
    },

    {
        label: "Executions",
        icon: ListTodo,
        path: "/jobs"
    },

    {
        label: "Workers",
        icon: Cpu,
        path: "/workers"
    },

    {
        label: "Worker Control",
        icon: SlidersHorizontal,
        path: "/worker-control"
    },
];
