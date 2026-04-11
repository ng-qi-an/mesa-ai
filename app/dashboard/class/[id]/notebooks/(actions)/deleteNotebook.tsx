'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notebook } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function deleteNotebook(noteId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session|| !session.user) {
        throw new Error("Unauthorized")
    }
    return await db.delete(notebook).where(and(eq(notebook.userId, session.user.id), eq(notebook.id, noteId))).returning();
}