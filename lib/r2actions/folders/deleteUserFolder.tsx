'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { r2 } from "../../r2";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
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
    try {
        const userFilesPrefix = `user-files/${session.user.id!}/`;
        const objectKeys = new Set<string>();

        for (const row of allItems.rows as Array<{ id: string }>) {
            const itemKey = `${userFilesPrefix}${row.id}`;
            objectKeys.add(itemKey);

            // Files can have extracted images stored below their own key.
            let continuationToken: string | undefined;
            do {
                const command2 = new ListObjectsV2Command({
                    Bucket: process.env.R2_BUCKET_NAME!,
                    Prefix: `${itemKey}/`,
                    ContinuationToken: continuationToken,
                });
                const listedObjects = await r2.send(command2);
                listedObjects.Contents?.forEach((object) => {
                    if (object.Key) {
                        objectKeys.add(object.Key);
                    }
                });
                continuationToken = listedObjects.IsTruncated
                    ? listedObjects.NextContinuationToken
                    : undefined;
            } while (continuationToken);
        }

        const keys = [...objectKeys];
        for (let index = 0; index < keys.length; index += 1000) {
            const command = new DeleteObjectsCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Delete: {
                    Objects: keys.slice(index, index + 1000).map((Key) => ({ Key })),
                },
            });
            const res = await r2.send(command);
            if (res.Errors?.length) {
                throw new Error(`Failed to delete objects in R2: ${res.Errors.map((error) => error.Key).join(", ")}`);
            }
        }

        console.log("Deleted items: ", keys.join(", "));
        await db.delete(files).where(eq(files.id, folderId))
    } catch (error) {
        console.log("Error deleting folder in R2:", error);
        throw error;
    }
}
