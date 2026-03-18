'use server';
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/schemas/schema";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";



export default async function deleteChat(chatId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const chat  = await db.query.chats.findFirst({
        where: and(eq(chats.userId, session.user.id), eq(chats.id, chatId)),
        with: {
            chatFiles: true
        }
    })
    if (!chat){
        throw new Error("Chat not found")
    }
    const chatFilesKeys = chat.chatFiles.map((file)=> ({Key : `user-files/${session!.user.id!}/${file.id}`}))
    if (chatFilesKeys.length > 0){
        console.log("Deleting chat files with keys:", chatFilesKeys);
        const command = new DeleteObjectsCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Delete: {
                Objects: chatFilesKeys
            }
        })
        try {
            await r2.send(command)
        } catch (error) {
            console.log("Error deleting chat files from R2:", error);
            throw new Error("Error deleting chat files");
        }
    }
    await db.delete(chats).where(and(eq(chats.userId, session.user.id), eq(chats.id, chatId))).returning()
    
}