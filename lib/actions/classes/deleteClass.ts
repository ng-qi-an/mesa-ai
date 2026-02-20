'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import getAllClassesServer from "./getAllClasses";

export default async function deleteClassServer(classId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    await db.delete(classes).where(eq(classes.id, classId));
    return await getAllClassesServer();
}