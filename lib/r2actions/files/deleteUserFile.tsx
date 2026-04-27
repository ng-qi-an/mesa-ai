'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { db } from "../../db";
import { files } from "../../schemas/schema";
import { and, eq, isNull } from "drizzle-orm";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import deleteStoreFiles from "@/lib/file-search-actions/deleteStoreFiles";
import { deleteIndexedFilesByIds } from "@/lib/rag/deleteIndexedFiles";


export default async function deleteUserFile(fileId: string, parent: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    console.log("Deleting file:", fileId, "parent:", parent, "for user:", session.user.id);
    try {
        const fileRecord = await db.query.files.findFirst({
            where: (files, {eq})=> eq(files.id, fileId),
            with: {
                class: true
            }
        })
        if (!fileRecord) {
            throw new Error("File not found in database");
        }
        await db.delete(files).where(and(
            eq(files.userId, session.user.id),
            eq(files.id, fileId),
            !parent ? isNull(files.parentId) : eq(files.parentId, parent)
        )).returning()
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: `user-files/${session!.user.id!}/${fileId}`,
        })
        const res = await r2.send(command)
        if (res.DeleteMarker){
            console.log("File deleted from R2:", fileId);
        }
        if (fileRecord.class.fileStoreId){
            await deleteStoreFiles(fileRecord.class.fileStoreId, [fileRecord.id]);
        }
        await deleteIndexedFilesByIds(session.user.id, [fileRecord.id]);
    } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Failed to delete file");
    }
}