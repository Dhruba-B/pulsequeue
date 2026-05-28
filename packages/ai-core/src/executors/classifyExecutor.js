import { classifyText } from "../providers/ollamaProvider.js";

export const classifyExecutor = async (job) => {
    const text = job.payload.text;
    const labels = Array.isArray(job.payload.labels) && job.payload.labels.length > 0
        ? job.payload.labels
        : ["FINANCE", "HEALTHCARE", "GENERAL"];

    const lower = text.toLowerCase();

    let label = labels.includes("GENERAL") ? "GENERAL" : labels[0];

    if (labels.includes("FINANCE") && lower.includes("payment")) {
        label = "FINANCE";
    }

    if (labels.includes("HEALTHCARE") && lower.includes("medical")) {
        label = "HEALTHCARE";
    }

    const classifyTextResult = await classifyText({
        text,
        model: job.execution?.model,
        labels,
    });

    return {
        label: classifyTextResult?.labels?.length > 0 ? classifyTextResult?.labels[0]?.label : label,
        labels: classifyTextResult?.labels,
        model: job.execution?.model || "rules/classifier-v1",
        runtime: job.execution?.runtime || "rules/local-classifier",
    };
};
