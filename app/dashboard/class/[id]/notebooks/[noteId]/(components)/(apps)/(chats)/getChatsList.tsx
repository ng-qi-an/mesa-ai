'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function getChatsList(notebookId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    return await db.select().from(chats).where(and(eq(chats.notebookId, notebookId), eq(chats.userId, session.user.id)));
}