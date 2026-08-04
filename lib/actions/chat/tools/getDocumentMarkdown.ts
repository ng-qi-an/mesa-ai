import { tool } from "ai";
import z from "zod";

export const getDocumentMarkdown = (documentMarkdown: string) => tool({
    description: `
        - Returns only the markdown of a BlockNote document as a string.
        - This should only be used to provide context for general user queries, and not for editing the document.
        - For editing, use getDocumentState and applyDocumentOperations instead.
    `,
    inputSchema: z.object({}),
    execute: async () => documentMarkdown,
})