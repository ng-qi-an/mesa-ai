'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { topics } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function deleteTopicServer(topicId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    const topic = (await db.select().from(topics).where(and(eq(topics.id, topicId), eq(topics.userId, session.user.id))))[0];
    if (!topic) {
        throw new Error("Unauthorized")
    }
    await db.delete(topics).where(eq(topics.id, topicId));
}