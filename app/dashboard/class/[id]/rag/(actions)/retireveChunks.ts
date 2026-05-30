import { cosineDistance, sql } from "drizzle-orm";
import { embedText } from "./embedding";
import { db } from "@/lib/db";
import { chunks } from "@/lib/schemas/rag-schema";

export interface SearchResult {
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  documentId: string;
}

export async function retrieveChunks(
  query: string,
  limit = 10,
  similarityThreshold = 0.3
): Promise<SearchResult[]> {
  console.log("🔍 Retrieving chunks for query:", query);

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(query);
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      throw new Error("Query embedding is invalid");
    }
  } catch (err) {
    console.error("Error generating embedding:", err);
    return [];
  }
  console.log("🧠 Generated query embedding of length:", queryEmbedding.length);

  try {
    const similarityExpr = sql<number>`1 - (${cosineDistance(chunks.embedding, queryEmbedding)})`;
    const baseQuery = db
      .select({
        content: chunks.content,
        metadata: chunks.metadata,
        documentId: chunks.documentId,
        similarity: similarityExpr,
      })
      .from(chunks)
      .orderBy(sql`${similarityExpr} DESC`)
      .limit(limit);

    const useThreshold = Number.isFinite(similarityThreshold) && similarityThreshold > 0;
    const results = useThreshold
      ? await baseQuery.where(sql`${similarityExpr} > ${similarityThreshold}`)
      : await baseQuery;

    if (!useThreshold) {
      console.warn("⚠️ Similarity threshold disabled (<= 0); returning top results only");
    }

    console.log("🔍 Found chunks:", results.map((result)=> result.similarity));
    return results.map(result => ({
      ...result,
      metadata: (result.metadata as Record<string, unknown>) || {},
    }));
  } catch (error) {
    console.error("Error retrieving chunks:", error);
    throw Error("Failed to retrieve relevant document chunks");
  }
}