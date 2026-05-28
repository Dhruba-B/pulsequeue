import Tesseract from "tesseract.js";

export const ocrExecutor = async (job) => {
    const result = await Tesseract.recognize(
        job.payload.imageUrl,

        job.payload.language || "eng",
    );

    return {
        text: result.data.text,
        language: job.payload.language || "eng",
        model: job.execution?.model || "Tesseract OCR",
        runtime: job.execution?.runtime || "tesseract.js/local",
        confidence: result.data.confidence,
    };
};
