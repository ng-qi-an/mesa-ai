'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { r2 } from "../../r2";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { db } from "../../db";
import { files } from "../../schemas/schema";
import { eq, sql } from "drizzle-orm";



export default async function deleteUserFolder(folderId: string, confirmation: boolean = false){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    // Use raw SQL for recursive CTE since Drizzle ORM does not support recursive CTEs via query builder
    const allItems = await db.execute(
        sql`
            WITH RECURSIVE folder_tree AS (
                SELECT id FROM files WHERE id = ${folderId}
                UNION ALL
                SELECT f.id FROM files f
                INNER JOIN folder_tree ft ON f.parent_id = ft.id
            )
            SELECT id FROM folder_tree
        `
    );
    if (!confirmation) {
        // If confirmation is not provided, return the list of items that would be deleted
        return allItems.rows;
    }
    const folderRecord = await db.query.files.findFirst({
        where: eq(files.id, folderId),
        with: {
            class: true
        }
    })
    if (!folderRecord) {
        throw new Error("Folder not found");
    }
    console.log("Deleting folder and all nested items for user:", session.user.id, "with folder id:", folderId, "Items to delete:", allItems.rows.length);
    const command = new DeleteObjectsCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Delete: {
            Objects: allItems.rows.map((row: any) => ({
                Key: `user-files/${session!.user.id!}/${row.id}`
            }))
        }
    })
    try {
        const res = await r2.send(command)
        if (!res.Deleted || res.Deleted.length !== allItems.rows.length) {
            throw new Error("Failed to delete folders in R2");
        }
        console.log("Deleted items: ", res.Deleted.map(d => d.Key).join(", "));
        await db.delete(files).where(eq(files.id, folderId))
    } catch (error) {
        console.log("Error deleting folder in R2:", error);
        throw error;
    }
}