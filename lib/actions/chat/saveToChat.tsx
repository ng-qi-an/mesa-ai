'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatInsert, chats } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function saveToChat(chatId: string, props: Partial<ChatInsert>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session){
        throw new Error("Not authenticated")
    }
    if (!chatId){
        throw new Error("Chat ID is required")
    }
    const copyProps = {...props}
    delete copyProps.userId;
    delete copyProps.id;
    copyProps.dateModified = new Date();
    console.log("Saving to chat with ID:", chatId, "and props:", copyProps);
    return await db.update(chats).set(copyProps).where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id))).returning();
}