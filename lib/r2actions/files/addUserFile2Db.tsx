'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { db } from "../../db";
import { files } from "../../schemas/schema";
import { generateId } from "better-auth";



export default async function addUserFile2Db(fileId: string, fileName: string, fileType: string, parent: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    console.log("Adding file for user:", session.user.id);
    try {
        return await db.insert(files).values({
            id: fileId,
            parentId: parent || null,
            name: fileName,
            contentType: fileType,
            userId: session.user.id
        }).returning();
    } catch (error) {
        console.log("Error creating file in database:", error);
        throw error;
    }
}