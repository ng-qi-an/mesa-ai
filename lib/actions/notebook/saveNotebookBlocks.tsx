'use server';
import { notebookSchemaServer } from "@/app/dashboard/class/[id]/notebooks/[noteId]/(components)/(notebook)/notebookSchemaServer";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notebook } from "@/lib/schemas/schema";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";


export default async function saveNotebookBlocks(noteId: string, {markdown, blocks}: {markdown?: string, blocks?: any[]}) {
    const session  =  await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    if (!markdown && !blocks) {
        throw new Error("Either markdown or blocks must be provided");
    }
    const editor = ServerBlockNoteEditor.create({
        schema: notebookSchemaServer
    })
    var finalBlocks = blocks || [];
    if (markdown){
        finalBlocks = await editor.tryParseMarkdownToBlocks(markdown) || [];
    }
    const finalMarkdown = markdown || await editor.blocksToMarkdownLossy(finalBlocks) || "";
    await db.update(notebook).set({blocks: finalBlocks, content: finalMarkdown}).where(and(eq(notebook.id, noteId), eq(notebook.userId, session.user.id)));
    return {blocks: finalBlocks, markdown: finalMarkdown};
}