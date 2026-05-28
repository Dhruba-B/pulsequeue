import { translateText } from "../providers/ollamaProvider.js";

export const translateExecutor = async (job) => {
    const translated = await translateText({
        text: job.payload.text,
        model: job.execution?.model,
        sourceLanguage: job.payload.sourceLanguage,
        targetLanguage: job.payload.targetLanguage,
    });

    return {
        translated,
        sourceLanguage: job.payload.sourceLanguage || "auto",
        targetLanguage: job.payload.targetLanguage || "Bengali",
        model: job.execution?.model || "qwen2.5:3b",
        runtime: job.execution?.runtime || "ollama/local-llm",
    };
};
