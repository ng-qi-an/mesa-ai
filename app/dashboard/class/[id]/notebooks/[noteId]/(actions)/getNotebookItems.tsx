'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export default async function getNotebookItems(noteId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session|| !session.user) {
        throw new Error("Unauthorized")
    } 
    const raw = await db.query.notebook.findFirst({
        where: (notebook, {eq, and}) => and(eq(notebook.id, noteId), eq(notebook.userId, session.user.id)),
        columns: {},
        with: {
            chats: {
                columns: {id: true, name: true, dateCreated: true, dateModified: true}
            },
            quizzes: {
                columns: {id: true, name: true, dateCreated: true, dateModified: true}
            },
        }
    })
    return raw;
}