'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notebook } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { headers } from "next/headers";

export async function createNotebook(classId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session|| !session.user) {
        throw new Error("Unauthorized")
    }
    return await db.insert(notebook).values({
        id: generateId(12),
        userId: session.user.id,
        classId,
        name: "New Notebook"
    }).returning();
}