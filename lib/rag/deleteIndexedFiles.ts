import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { ragChunks, ragIndexJobs } from "@/lib/schemas/schema";

export async function deleteIndexedFilesByIds(userId: string, fileIds: string[]) {
    if (fileIds.length === 0) {
        return;
    }

    await db
        .delete(ragChunks)
        .where(and(eq(ragChunks.userId, userId), inArray(ragChunks.fileId, fileIds)));

    await db
        .delete(ragIndexJobs)
        .where(and(eq(ragIndexJobs.userId, userId), inArray(ragIndexJobs.fileId, fileIds)));
}

export async function deleteIndexedFilesByClass(userId: string, classId: string) {
    await db
        .delete(ragChunks)
        .where(and(eq(ragChunks.userId, userId), eq(ragChunks.classId, classId)));

    await db
        .delete(ragIndexJobs)
        .where(and(eq(ragIndexJobs.userId, userId), eq(ragIndexJobs.classId, classId)));
}
