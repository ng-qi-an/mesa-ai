'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notebookFiles } from "@/lib/schemas/schema";
import { headers } from "next/headers";

export async function addNotebookFiles(noteId: string, fileIds: string[]){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session|| !session.user) {
        throw new Error("Unauthorized")
    }
    return await db.insert(notebookFiles).values(fileIds.map((id) => ({ notebookId: noteId, fileId: id }))).returning();
}