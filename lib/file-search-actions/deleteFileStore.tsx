'use server';
import { GoogleGenAI } from "@google/genai";
import { auth } from "../auth";
import { headers } from "next/headers";
import { db } from "../db";
import { notebook } from "../schemas/schema";
import { and, eq } from "drizzle-orm";

export default async function deleteFileStore(noteId: string){
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const note = await db.select({fileStoreId: notebook.fileStoreId}).from(notebook).where(and(eq(notebook.userId, session.user.id), eq(notebook.id, noteId)));
    if (note[0].fileStoreId){
        await ai.fileSearchStores.delete({
            name: note[0].fileStoreId!,
            config: {
                force: true
            }
    })
    }
}