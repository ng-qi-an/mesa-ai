import { and, cosineDistance, inArray, sql } from "drizzle-orm";
import { embedText } from "./embedding";
import { db } from "@/lib/db";
import { fileChunks } from "../schemas/schema";

const similarityThreshold = 0.2; // Adjust this threshold as needed (0 to 1, where 1 is identical)

export interface SearchResult {
  content: string;
  similarity: number;
  fileId: string;
}

export async function retrieveChunks(fileIds: string[], query: string, limit = 10): Promise<SearchResult[]> {
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
    const similaritySQL = sql<number>`1 - (${cosineDistance(fileChunks.embedding, queryEmbedding)})`;
    const results = await db.select({content: fileChunks.content, fileId: fileChunks.fileId, similarity: similaritySQL}).from(fileChunks).where(and(sql`${similaritySQL} > ${similarityThreshold}`, inArray(fileChunks.fileId, fileIds))).orderBy(sql`${similaritySQL} DESC`).limit(limit);
    console.log("🔍 Found chunks:", results.map((result)=> result.similarity));
    console.log("File ids", results.map((result)=> result.fileId));
    return results
  } catch (error) {
    console.error("Error retrieving chunks:", error);
    throw Error("Failed to retrieve relevant document chunks");
  }
}