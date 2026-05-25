import {
    LayoutDashboard,
    ListTodo,
    Cpu,
    SlidersHorizontal,
    AlertTriangle,
    BarChart3,
    Settings
} from "lucide-react";

export const NAV_ITEMS = [

    {
        label: "Overview",
        icon: LayoutDashboard,
        path: "/"
    },

    {
        label: "Jobs",
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
