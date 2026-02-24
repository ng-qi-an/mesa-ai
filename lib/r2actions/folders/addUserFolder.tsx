'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { r2 } from "../../r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "../../db";
import { files } from "../../schemas/schema";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";



export default async function addUserFolder(name: string, parent: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    console.log("Creating folder for user:", session.user.id, "with folder name:", name, "and parent:", parent);
    const folderId = generateId(6)
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: `user-files/${session!.user.id!}/${folderId}`,
        Body: Buffer.alloc(0),
        ContentType: "application/x-directory"
    })
    try {
        const res = await r2.send(command)
        if (!res.ETag){
            throw new Error("Failed to create folder in R2");
        }
        const existingFiles = await db.select().from(files).where(and(eq(files.userId, session.user.id), eq(files.parentId, parent), eq(files.name, name)));
        if (existingFiles.length > 0) {
            console.log("Folder with the same name already exists in the database for this user.");
            throw new Error("already_exists");
        }
        return await db.insert(files).values({
            id: folderId,
            parentId: parent || null,
            name: name,
            contentType: "application/x-directory",
            userId: session.user.id
        }).returning();
    } catch (error) {
        console.log("Error creating folder in R2:", error);
        throw error;
    }
}