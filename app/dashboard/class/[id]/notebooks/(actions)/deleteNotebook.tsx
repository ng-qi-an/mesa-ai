'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import deleteFileStore from "@/lib/file-search-actions/deleteFileStore";
import { notebook } from "@/lib/schemas/schema";
import { ApiError } from "@google/genai";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function deleteNotebook(noteId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session|| !session.user) {
        throw new Error("Unauthorized")
    }
    try {
        await deleteFileStore(noteId);
    } catch (error) {
        if (!(error instanceof ApiError && error.status == 404)){
            console.log("Error deleting file store for notebook:", error);
            throw error;
        }
    }
    return await db.delete(notebook).where(and(eq(notebook.userId, session.user.id), eq(notebook.id, noteId))).returning();
}