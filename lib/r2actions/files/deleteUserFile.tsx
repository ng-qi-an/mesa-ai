'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { db } from "../../db";
import { files } from "../../schemas/schema";
import { and, eq } from "drizzle-orm";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";


export default async function deleteUserFile(fileId: string, parent: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    console.log("Deleting file for user:", session.user.id);
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: `user-files/${session!.user.id!}/${fileId}`,
    })
    try {
        const res = await r2.send(command)
        if (res.DeleteMarker){
            console.log("File deleted from R2:", fileId);
        }
    } catch (error) {
        console.log("Error deleting file from R2:", error);
    }
    try {
        return (await db.delete(files).where(and(
            eq(files.userId, session.user.id),
            eq(files.id, fileId),
            eq(files.parentId, parent || "")
        ))).rowCount
    } catch (error) {
        console.log("Error deleting file in database:", error);
        throw error;
    }
}