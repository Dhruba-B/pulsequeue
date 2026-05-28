import { summarizeText } from "../providers/ollamaProvider.js";

export const summarizeExecutor = async (job) => {
    const text = job.payload.text;

    const summary = await summarizeText({
        text,
        model: job.execution?.model,
        summaryLength: job.payload.summaryLength,
    });

    return {
        summary,
        model: job.execution?.model || "qwen2.5:3b",
        runtime: job.execution?.runtime || "ollama/local-llm",
        summaryLength: job.payload.summaryLength || "medium",
    };
};
