export const AI_JOB_TYPES = ["SUMMARIZE", "EMBED", "OCR", "TRANSLATE", "CLASSIFY"];

export const AI_MODEL_OPTIONS = {
    SUMMARIZE: ["qwen2.5:3b", "llama3.2"],
    TRANSLATE: ["qwen2.5:3b", "llama3.2"],
    CLASSIFY: ["qwen2.5:3b", "llama3.2", "rules/classifier-v1"],
    EMBED: ["Xenova/all-MiniLM-L6-v2", "Xenova/bge-small-en-v1.5"],
    OCR: ["Tesseract OCR"],
};

export const RUNTIME_OPTIONS = {
    SUMMARIZE: ["ollama/local-llm"],
    TRANSLATE: ["ollama/local-llm"],
    CLASSIFY: ["ollama/local-llm", "rules/local-classifier"],
    EMBED: ["transformers.js/local"],
    OCR: ["tesseract.js/local"],
};

export const JOB_TYPE_CONFIG = {
    SUMMARIZE: {
        label: "Summarize",
        capability: "SUMMARIZE",
        description: "Condense long text through an LLM worker.",
        payload: {
            text: "Paste source text for distributed summarization.",
            summaryLength: "medium",
        },
    },
    EMBED: {
        label: "Embed",
        capability: "EMBED",
        description: "Generate vector metadata through an embedding worker.",
        payload: {
            text: "Text to embed into a semantic vector.",
            pooling: "mean",
            normalize: true,
        },
    },
    OCR: {
        label: "OCR",
        capability: "OCR",
        description: "Extract text from an image URL through an OCR worker.",
        payload: {
            imageUrl: "https://example.com/document.png",
            language: "eng",
        },
    },
    TRANSLATE: {
        label: "Translate",
        capability: "TRANSLATE",
        description: "Translate source text through a local LLM runtime.",
        payload: {
            text: "Text to translate.",
            sourceLanguage: "auto",
            targetLanguage: "Bengali",
        },
    },
    CLASSIFY: {
        label: "Classify",
        capability: "CLASSIFY",
        description: "Route text through a classifier with operator-defined labels.",
        payload: {
            text: "Text to classify.",
            labels: ["FINANCE", "HEALTHCARE", "GENERAL"],
        },
    },
};

export const getDefaultExecution = (type) => ({
    model: AI_MODEL_OPTIONS[type][0],
    runtime: RUNTIME_OPTIONS[type][0],
    preferredCapability: JOB_TYPE_CONFIG[type].capability,
    workerAffinity: "",
    timeoutMs: 60000,
});
