'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes, ClassSelect } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function updateClass(classId: string, options: Partial<ClassSelect>){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    return await db.update(classes).set(options).where(and(eq(classes.id, classId), eq(classes.userId, session.user.id))).returning();
}