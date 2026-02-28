'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { db } from "../../db";
import { files } from "../../schemas/schema";
import { and, eq } from "drizzle-orm";



export default async function moveUserFile(fileId: string, fileName: string, newParentId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const conflictFiles = await db.select().from(files).where(and(eq(files.userId, session.user.id), eq(files.parentId, newParentId), eq(files.name, fileName)));
    if (conflictFiles.length > 0) {
        throw new Error("already_exists");
    }
    try {
        return await db.update(files).set({parentId: newParentId}).where(eq(files.id, fileId)).returning()
    } catch (error) {
        console.log("Error moving file in DB:", error);
        throw error;
    }
}