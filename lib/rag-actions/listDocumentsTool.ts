import { tool } from "ai";
import { z } from "zod";
import { files } from "../schemas/schema";
import { inArray } from "drizzle-orm";
import { db } from "../db";

export const listDocumentsTool = (fileIds: string[]) => (tool({
    description: "List the user's uploaded documents (PDFs, images, slide decks). Provides a summary of each document, along with names and IDs for context building. Should be used before searchDocuments to understand what documents are available.",
    inputSchema: z.object({}),
    execute: async ({}) => {
        const _files = await db.select({name: files.name, id: files.id, summary: files.summary}).from(files).where(inArray(files.id, fileIds));
        return {
            files: _files.map(f=> ({...f, summary: f.summary || "No summary available"})),
        };
    },
}));