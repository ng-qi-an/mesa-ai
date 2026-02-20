'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { headers } from "next/headers";

export default async function createClassServer( name: string, subject: string, theme: string, icon: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
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