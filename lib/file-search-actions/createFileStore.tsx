'use server';
import { GoogleGenAI } from "@google/genai";
import { auth } from "../auth";
import { headers } from "next/headers";
import { db } from "../db";
import { notebook } from "../schemas/schema";
import { eq } from "drizzle-orm";

export default async function createFileStore(noteId: string){
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const fileSearchStore = await ai.fileSearchStores.create({
        config: { displayName: noteId }
    });
    await db.update(notebook).set({fileStoreId: fileSearchStore.name!}).where(eq(notebook.id, noteId));
    return fileSearchStore;
}