import { GoogleGenAI } from "@google/genai";

let ai;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const askGemini = async (prompt, systemInstruction) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    if (!ai) {
        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction,
                    temperature: 0.7,
                    maxOutputTokens: 3000,
                },
            });

            return (response.text || "").trim();

        } catch (error) {
            lastError = error;

            const status = error?.status;

            console.error(
                `Gemini attempt ${attempt} failed:`,
                status,
                error?.message
            );

            // Retry temporary Google/Gemini failures
            if (status === 429 || status === 503) {
                if (attempt < 3) {
                    await sleep(attempt * 1500);
                    continue;
                }
            }

            throw error;
        }
    }

    throw lastError;
};
