'use server';
import constructProvider from "@/lib/utils/constructProvider";
import { embeddingModel } from "@/lib/utils/models";
import { embed, embedMany } from "ai";


export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: constructProvider(embeddingModel).embedding(embeddingModel.name),
    value: text,
  });
  return embedding;
}

export async function embedManyTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: constructProvider(embeddingModel).embedding(embeddingModel.name),
    values: texts,
  });
  return embeddings;
}