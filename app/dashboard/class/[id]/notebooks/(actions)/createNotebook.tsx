'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import createFileStore from "@/lib/file-search-actions/createFileStore";
import deleteFileStore from "@/lib/file-search-actions/deleteFileStore";
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
    const id = generateId(12);
    const store = await createFileStore(id);
    try {
    return await db.insert(notebook).values({
        id: id,
        userId: session.user.id,
        classId,
        fileStoreId: store.name!,
        name: "New Notebook"
    }).returning();
    } catch (error) {
        console.log("Error creating notebook in DB:", error);
        await deleteFileStore(id);
        throw error;
    }
}