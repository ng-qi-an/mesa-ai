import { DocumentState } from "@blocknote/xl-ai";
import { tool } from "ai";
import z from "zod";

export const getDocumentStateTool = (documentState: DocumentState<any>) => tool({
    description: `
        Returns the latest authoritative BlockNote document state as JSON.

        Call this before using applyDocumentOperations in the current request.

        When selection is true:
        - selectedBlocks are the only blocks with editable IDs.
        - Use only selectedBlocks IDs for updates or deletions.
        - The blocks field is context only and intentionally does not expose IDs.

        When selection is false:
        - blocks contains the current editable document block IDs.
        - Use IDs exactly as returned, including the trailing "$" suffix.
        - The cursor position is marked with cursor: true.

        Never use document IDs from previous messages or previous tool results.
    `,
    inputSchema: z.object({}),
    execute: async () => documentState,
})