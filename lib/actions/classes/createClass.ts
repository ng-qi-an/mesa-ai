'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import createFileStore from "@/lib/file-search-actions/createFileStore";
import { classes } from "@/lib/schemas/schema";
import { availableSubjects } from "@/lib/subjects/subjectsList";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function createClassServer( name: string, subject: keyof typeof availableSubjects, theme: string, icon: string) {
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
    const classId = generateId(9);

    return await db.insert(classes).values({
        id: classId,
        name: name,
        subject: subject,
        theme: theme,
        icon: icon,
        userId: session.user.id,
        fileStoreId: "nothing"
    }).returning();
}
