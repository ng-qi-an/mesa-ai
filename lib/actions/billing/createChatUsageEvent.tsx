'use server';

import { usageEvents } from "@/lib/schemas/schema";
import generateChatUsageEvent from "./generateChatUsageEvent";
import { db } from "@/lib/db";

export default async function createChatUsageEvent({totalTokens, userId, chatId, noteId}:{totalTokens:number, userId:string, chatId:string, noteId?:string}){
    const usageEvent = await generateChatUsageEvent({totalTokens, userId, chatId, noteId});
    const result = await db.insert(usageEvents).values(usageEvent).returning();
    return result[0];
}