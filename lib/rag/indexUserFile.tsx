'use server';

import { headers } from "next/headers";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { createHash } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ragChunks, ragIndexJobs } from "@/lib/schemas/schema";
import getUserFileContent from "@/lib/r2actions/files/getUserFileContent";
import { chunkText } from "@/lib/rag/chunkText";
import { extractTextFromFile } from "@/lib/rag/extractText";
import { embedTexts } from "@/lib/rag/embeddings";

function estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
}

async function setIndexJobStatus(params: {
    jobId: string;
    status: "pending" | "running" | "succeeded" | "failed";
    attempts?: number;
    error?: string | null;
    contentHash?: string | null;
    startedAt?: Date | null;
    finishedAt?: Date | null;
}) {
    await db
        .update(ragIndexJobs)
        .set({
            status: params.status,
            attempts: params.attempts,
            error: params.error ?? null,
            contentHash: params.contentHash ?? null,
            startedAt: params.startedAt,
            finishedAt: params.finishedAt,
            dateModified: new Date(),
        })
        .where(eq(ragIndexJobs.id, params.jobId));
}

export default async function indexUserFile(fileId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }

    const fileRecord = await db.query.files.findFirst({
        where: (table, { and, eq }) => and(eq(table.id, fileId), eq(table.userId, session.user.id)),
    });

    if (!fileRecord) {
        throw new Error("File not found");
    }

    const existingJob = await db.query.ragIndexJobs.findFirst({
        where: (table, { eq }) => eq(table.fileId, fileId),
    });

    const jobId = existingJob?.id ?? generateId(12);
    const nextAttempts = (existingJob?.attempts ?? 0) + 1;

    if (!existingJob) {
        await db.insert(ragIndexJobs).values({
            id: jobId,
            userId: session.user.id,
            classId: fileRecord.classId,
            fileId,
            status: "pending",
            attempts: 0,
        });
    }

    await setIndexJobStatus({
        jobId,
        status: "running",
        attempts: nextAttempts,
        startedAt: new Date(),
        finishedAt: null,
        error: null,
    });

    try {
        const fileContent = await getUserFileContent(fileId);
        if (!fileContent.data) {
            throw new Error("Unable to load file bytes from R2");
        }

        const resolvedType = fileContent.ContentType ?? fileRecord.contentType;
        const bytes = fileContent.data;
        const contentHash = createHash("sha256").update(Buffer.from(bytes)).digest("hex");

        const extractedText = await extractTextFromFile({
            bytes,
            contentType: resolvedType,
        });

        const chunks = chunkText(extractedText);
        if (chunks.length === 0) {
            throw new Error("No indexable text found in file");
        }

        const embeddings: number[][] = [];
        const batchSize = 24;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const batchEmbeddings = await embedTexts(batch);
            embeddings.push(...batchEmbeddings);
        }

        if (embeddings.length !== chunks.length) {
            throw new Error("Embedding response count mismatch");
        }

        // Delete existing chunks for this file (Neon HTTP driver doesn't support transactions)
        await db
            .delete(ragChunks)
            .where(and(eq(ragChunks.userId, session.user.id), eq(ragChunks.fileId, fileId)));

        // Insert new chunks
        await db.insert(ragChunks).values(
            chunks.map((chunk, idx) => ({
                id: generateId(15),
                userId: session.user.id,
                classId: fileRecord.classId,
                fileId,
                chunkIndex: idx,
                content: chunk,
                tokenCount: estimateTokenCount(chunk),
                embedding: embeddings[idx],
                metadata: {
                    fileName: fileRecord.name,
                    contentType: resolvedType,
                },
            })),
        );

        // Mark job as succeeded
        await db
            .update(ragIndexJobs)
            .set({
                status: "succeeded",
                attempts: nextAttempts,
                error: null,
                contentHash,
                finishedAt: new Date(),
                dateModified: new Date(),
            })
            .where(eq(ragIndexJobs.id, jobId));

        return {
            fileId,
            chunksIndexed: chunks.length,
            status: "succeeded" as const,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown indexing error";
        await setIndexJobStatus({
            jobId,
            status: "failed",
            attempts: nextAttempts,
            error: message.slice(0, 1500),
            finishedAt: new Date(),
        });
        throw error;
    }
}
