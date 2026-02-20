'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes, topics } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function createTopicServer(name: string, icon: string, classId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    const existingTopic = (await db.select().from(topics).where(and(eq(topics.classId, classId), eq(topics.name, name))))[0];
    if (existingTopic) {
        throw new Error("already_exists")
    }
    const _class = (await db.select().from(classes).where(and(eq(classes.id, classId), eq(classes.userId, session.user.id))))[0];
    if (!_class) {
        throw new Error("Unauthorized")
    }
    return await db.insert(topics).values({
        id: generateId(),
        name: name,
        icon: icon,
        userId: session.user.id,
        classId: classId,
    }).returning();
}