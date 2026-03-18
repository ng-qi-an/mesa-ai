'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { headers } from "next/headers";

export default async function createChat(noteId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    return await db.insert(chats).values({
        id: generateId(12),
        name: "New Chat",
        notebookId: noteId,
        userId: session.user.id,
        messages: []
    }).returning()
}