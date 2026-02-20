'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function createClassServer( name: string, subject: string, theme: string, icon: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    const existingClass = (await db.select().from(classes).where(and(eq(classes.userId, session.user.id), eq(classes.name, name))))[0];
    if (existingClass) {
        throw new Error("already_exists")
    }
    return await db.insert(classes).values({
        id: generateId(),
        name: name,
        subject: subject,
        theme: theme,
        icon: icon,
        userId: session.user.id,
    }).returning();
}