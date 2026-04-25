'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { topics } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function getTopicServer(topicId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    return (await db.select().from(topics).where(and(eq(topics.userId, session.user.id), eq(topics.id, topicId))))[0];
}