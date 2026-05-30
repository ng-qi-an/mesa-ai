import { tool } from "ai";
import { z } from "zod";
import { retrieveChunks } from "./retireveChunks";

export const searchDocumentsTool = tool({
    description:
        "Search the user's uploaded documents (PDFs, slide decks) for relevant context. " +
        "Use this whenever the user asks a question about their documents.",
    inputSchema: z.object({
        query: z
        .string()
        .describe("The search query to find relevant document chunks"),
        limit: z
        .number()
        .optional()
        .default(10)
        .describe("Number of results to return (max 20)"),
    }),
    execute: async ({ query, limit }) => {
        console.log("🔍 Searching documents with query:", query);
        const results = await retrieveChunks(query, Math.min(limit ?? 10, 20));
        return {
            results: results.map((r) => ({
                content: r.content,
                similarity: r.similarity,
            })),
        };
    },
});