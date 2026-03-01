'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { db } from "../../db";
import { files } from "../../schemas/schema";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";



export default async function addUserFile2Db(fileId: string, fileName: string, fileType: string, parent: string, classId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    console.log("Adding file for user:", session.user.id);
    try {
        const conflictFiles = await db.select().from(files).where(and(eq(files.userId, session.user.id), eq(files.parentId, parent || ""), eq(files.name, fileName)));
        if (conflictFiles.length > 0) {
            throw new Error("File already exists");
        }
        return await db.insert(files).values({
            id: fileId,
            parentId: parent || null,
            name: fileName,
            contentType: fileType,
            userId: session.user.id,
            classId
        }).returning();
    } catch (error) {
        console.log("Error creating file in database:", error);
        throw error;
    }
}