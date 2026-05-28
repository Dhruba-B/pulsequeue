import { pipeline } from "@xenova/transformers";

const embedders = new Map();

const getEmbedder = async (model) => {
  if (!embedders.has(model)) {
    const embedder = await pipeline(
      "feature-extraction",

      model,
    );

    embedders.set(model, embedder);
  }

  return embedders.get(model);
};

export const embedExecutor = async (job) => {
  const model = job.execution?.model || "Xenova/all-MiniLM-L6-v2";
  const extractor = await getEmbedder(model);

  const output = await extractor(
    job.payload.text,

    {
      pooling: job.payload.pooling || "mean",

      normalize: job.payload.normalize ?? true,
    },
  );

  return {
    embedding: Array.from(output.data),
    dimensions: output.data.length,
    model,
    runtime: job.execution?.runtime || "transformers.js/local",
    pooling: job.payload.pooling || "mean",
    normalized: job.payload.normalize ?? true,
  };
};
