import {
    LayoutDashboard,
    ListTodo,
    Cpu,
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
        label: "Failed Jobs",
        icon: AlertTriangle,
        path: "/failed"
    },

    {
        label: "Metrics",
        icon: BarChart3,
        path: "/metrics"
    },

    {
        label: "Settings",
        icon: Settings,
        path: "/settings"
    }
];