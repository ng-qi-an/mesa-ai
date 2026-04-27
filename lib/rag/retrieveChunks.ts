import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { files, ragChunks } from "@/lib/schemas/schema";
import { embedTexts } from "@/lib/rag/embeddings";

export type RetrievedChunk = {
    fileId: string;
    chunkIndex: number;
    content: string;
    score: number;
    metadata: Record<string, unknown>;
};

type RetrieveChunksParams = {
    userId: string;
    fileIds: string[];
    query: string;
    classId?: string;
    limit?: number;
};

function serializeVector(values: number[]): string {
    return `[${values.join(",")}]`;
}

export async function retrieveChunks({
    userId,
    fileIds,
    query,
    classId,
    limit = 12,
}: RetrieveChunksParams): Promise<RetrievedChunk[]> {
    const uniqueFileIds = Array.from(new Set(fileIds));
    if (uniqueFileIds.length === 0) {
        return [];
    }

    const fileRows = await db
        .select({ id: files.id, classId: files.classId })
        .from(files)
        .where(and(eq(files.userId, userId), inArray(files.id, uniqueFileIds)));

    if (fileRows.length !== uniqueFileIds.length) {
        throw new Error("One or more source files are missing or inaccessible");
    }

    const classIds = Array.from(new Set(fileRows.map((row) => row.classId)));
    if (classIds.length !== 1) {
        throw new Error("Selected files must belong to the same class");
    }

    const resolvedClassId = classId ?? classIds[0];
    if (resolvedClassId !== classIds[0]) {
        throw new Error("Class and file selection mismatch");
    }

    const [queryEmbedding] = await embedTexts([query]);
    const vectorValue = serializeVector(queryEmbedding);
    const vectorSql = sql.raw(`'${vectorValue}'::vector`);
    const distanceExpr = sql<number>`${ragChunks.embedding} <=> ${vectorSql}`;

    const rows = await db
        .select({
            fileId: ragChunks.fileId,
            chunkIndex: ragChunks.chunkIndex,
            content: ragChunks.content,
            metadata: ragChunks.metadata,
            score: sql<number>`1 - (${distanceExpr})`,
        })
        .from(ragChunks)
        .where(
            and(
                eq(ragChunks.userId, userId),
                eq(ragChunks.classId, resolvedClassId),
                inArray(ragChunks.fileId, uniqueFileIds),
            ),
        )
        .orderBy(distanceExpr)
        .limit(limit);

    return rows.map((row) => ({
        fileId: row.fileId,
        chunkIndex: row.chunkIndex,
        content: row.content,
        score: Number(row.score),
        metadata: (row.metadata ?? {}) as Record<string, unknown>,
    }));
}
