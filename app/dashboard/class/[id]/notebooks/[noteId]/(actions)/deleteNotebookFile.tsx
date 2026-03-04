'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notebookFiles } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function deleteNotebookFile(noteId: string, fileId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session|| !session.user) {
        throw new Error("Unauthorized")
    }
    return await db.delete(notebookFiles).where(and(eq(notebookFiles.notebookId, noteId), eq(notebookFiles.fileId, fileId))).returning();
}