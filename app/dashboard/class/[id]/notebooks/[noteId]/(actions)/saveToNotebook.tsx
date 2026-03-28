'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notebook, NotebookInsert } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function SaveToNotebook(noteId: string, props: Partial<NotebookInsert>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session){
        throw new Error("Not authenticated")
    }
    if (!noteId){
        throw new Error("Notebook ID is required")
    }
    const copyProps = {...props}
    delete copyProps.userId;
    delete copyProps.classId;
    delete copyProps.id;
    delete copyProps.topicId;
    copyProps.dateModified = new Date();
    return await db.update(notebook).set(copyProps).where(and(eq(notebook.id, noteId), eq(notebook.userId, session.user.id))).returning();
}