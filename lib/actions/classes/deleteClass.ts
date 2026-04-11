'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes } from "@/lib/schemas/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import getAllClassesServer from "./getAllClasses";
import deleteFileStore from "@/lib/file-search-actions/deleteFileStore";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

export default async function deleteClassServer(classId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    const _class = await db.query.classes.findFirst({
        where: (classes, {and, eq}) => and(eq(classes.userId, session.user.id), eq(classes.id, classId)),
        with: {
            files: true
        }
    });
    if (!_class) {
        throw new Error("Class not found")
    }
    const command = new DeleteObjectsCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Delete: {
            Objects: _class.files.map(file => ({
                Key: `user-files/${session!.user.id!}/${file.id}`
            }))
        }
    })
    if (_class.fileStoreId) {
        await deleteFileStore(_class.fileStoreId);
    }
    try {
        await r2.send(command)
    } catch (error) {
        throw error;
    }
    await db.delete(classes).where(eq(classes.id, classId));
    return await getAllClassesServer();
}