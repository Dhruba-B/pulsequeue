import OpenAI from "openai";

let client = null;

const getClient = () => {
    if (!client) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY missing");
        }

        client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    return client;
};

export const summarizeText = async (text) => {
    const openai = getClient();
    const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
            {
                role: "system",

                content: "Summarize the input text clearly.",
            },

            {
                role: "user",

                content: text,
            },
        ],
    });

    return response.choices?.[0]?.message?.content;
};

export const translateText = async (text) => {
    const openai = getClient();

    const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
            {
                role: "system",

                content: "Translate the text accurately.",
            },

            {
                role: "user",

                content: text,
            },
        ],
    });

    return response.choices?.[0]?.message?.content;
};

