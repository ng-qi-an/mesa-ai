import { tool } from "ai";
import { z } from "zod";
import { retrieveChunks } from "./retireveChunks";

export const searchDocumentsTool = (fileIds: string[]) => (tool({
    description: "Search the user's uploaded documents (PDFs, slide decks) for relevant context.\nUse this whenever the user asks a question about their documents. Use a smaller limit (minimum of 5) for more specific queries (such as a person's role or actions, or a particular concept), and a larger limit (up to 20) for broader queries (large summaries, large groups of people, overarching concepts).",
    inputSchema: z.object({
        query: z
        .string()
        .describe("The search query to find relevant document chunks"),
        limit: z
        .number()
        .optional()
        .default(10)
        .describe("Number of results to return (min 5, max 20)"),
    }),
    execute: async ({ query, limit }) => {
        console.log("🔍 Searching documents with query:", query);
        const results = await retrieveChunks(fileIds, query, Math.min(limit ?? 5, 20));
        return {
            results: results.map((r) => ({
                content: r.content,
                similarity: r.similarity,
            })),
        };
    },
}));