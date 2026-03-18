'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatFiles } from "@/lib/schemas/schema";
import { FileUIPart } from "ai";
import { headers } from "next/headers";

export default async function addFileToChatFilesDb({files, chatId}:{files: (FileUIPart & {id: string})[], chatId: string}){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    return await db.insert(chatFiles).values(files.map((file)=>{
        return {
            id: file.id,
            userId: session.user.id, // Replace with actual user ID from session
            contentType: file.mediaType,
            chatId,
        }
    })).returning()
}