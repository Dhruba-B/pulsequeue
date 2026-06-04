import { Ollama } from "ollama";

const ollamaHost = process.env.OLLAMA_HOST || "http://ollama:11434";
const ollama = new Ollama({ host: ollamaHost });

export const summarizeText = async ({
    text,
    model = "qwen2.5:3b",
    summaryLength = "medium",
}) => {
    const response = await ollama.chat({
        model,
        messages: [
            {
                role: "system",

                content: `Summarize the input clearly. Target summary length: ${summaryLength}.`,
            },

            {
                role: "user",

                content: text,
            },
        ],
    });

    return response.message?.content;
};

export const translateText = async ({
    text,
    model = "qwen2.5:3b",
    sourceLanguage = "auto",
    targetLanguage = "Bengali",
}) => {
    const response = await ollama.chat({
        model,

        messages: [
            {
                role: "system",

                content: `Translate the input text accurately from ${sourceLanguage} to ${targetLanguage}. Return only the translated text.`,
            },

            {
                role: "user",

                content: text,
            },
        ],
    });

    return response.message?.content;
};

export const classifyText = async ({
    text,
    model = "qwen2.5:3b",
    labels = [],
}) => {
    const response = await ollama.chat({
        model,

        format: "json",

        messages: [
            {
                role: "system",

                content: `
                    You are a text classification engine.
                    
                    Classify the given input into the provided labels.
                    
                    Rules:
                    - Return ONLY valid JSON
                    - No markdown
                    - No explanation
                    - Confidence values must be between 0 and 1
                    - Total confidence should roughly sum to 1
                    
                    Expected response format:
                    
                    {
                        "labels": [
                        {
                            "label": "LABEL_NAME",
                            "confidence": 0.95
                        }
                        ]
                    }
                    
                    Available labels:
                    ${labels.join(", ")}
                  `,
            },

            {
                role: "user",

                content: text,
            },
        ],
    });

    try {
        return JSON.parse(response.message?.content || "{}");
    } catch (error) {
        return {
            labels: [],
            error: "Invalid JSON response from model",
        };
    }
};
