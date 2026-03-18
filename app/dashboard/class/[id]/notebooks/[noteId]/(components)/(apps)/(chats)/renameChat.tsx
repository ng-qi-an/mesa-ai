'use server';
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/schemas/schema";



export default async function renameChat(chatId: string, newName: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    await db.update(chats).set({name: newName, dateModified: new Date()}).where(and(eq(chats.userId, session.user.id), eq(chats.id, chatId))).returning()
    
}