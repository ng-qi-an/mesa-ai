'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { db } from "../../db";
import { files } from "../../schemas/schema";
import { and, eq } from "drizzle-orm";



export default async function renameUserFile(fileId: string, parentId: string, newName: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const conflictFiles = await db.select().from(files).where(and(eq(files.userId, session.user.id), eq(files.parentId, parentId), eq(files.name, newName)));
    if (conflictFiles.length > 0) {
        throw new Error("already_exists");
    }
    try {
        
        return await db.update(files).set({name: newName, dateModified: new Date()}).where(eq(files.id, fileId)).returning()
    } catch (error) {
        console.log("Error deleting file in R2:", error);
        throw error;
    }
}