'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes } from "@/lib/schemas/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function getAllClassesServer() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    return await db.select().from(classes).where(eq(classes.userId, session.user.id));
}