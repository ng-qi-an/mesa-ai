'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function getClassServer(classId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    return (await db.select().from(classes).where(and(eq(classes.userId, session.user.id), eq(classes.id, classId))))[0];
}