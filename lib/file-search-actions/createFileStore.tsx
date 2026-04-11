'use server';
import { GoogleGenAI } from "@google/genai";
import { auth } from "../auth";
import { headers } from "next/headers";

export default async function createFileStore(classId: string){
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
        config: { displayName: classId }
    });
    return fileSearchStore;
}