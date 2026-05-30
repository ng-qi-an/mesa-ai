'use server';
import { embed, embedMany } from "ai";

const embeddingModel = "text-embedding-3-small"

/** Embed a single text string */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

/** Batch-embed multiple texts (faster than one-by-one) */
export async function embedManyTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  });
  return embeddings;
}