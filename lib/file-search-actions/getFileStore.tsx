'use server';
import { GoogleGenAI } from "@google/genai";
import getClassServer from "../actions/classes/getClass";
import createFileStore from "./createFileStore";
import { db } from "../db";
import { classes } from "../schemas/schema";
import { eq } from "drizzle-orm";

export default async function getFileStore({fileStoreId, classId}: {fileStoreId?: string, classId?: string}){
    if (!fileStoreId && !classId) {
        throw new Error("fileStoreId and classId are required");
    } else {
        const ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });
        if (!fileStoreId && classId){
            const r = await getClassServer(classId)
            if (!r){
                throw new Error("Class not found")
            }
            if (!r.fileStoreId){
                const store = await createFileStore(classId);
                await db.update(classes).set({fileStoreId: store.name}).where(eq(classes.id, classId));
                return store;
            } else {
                return await ai.fileSearchStores.get({name: r.fileStoreId})
            }
        } else if (fileStoreId){
            return await ai.fileSearchStores.get({name: fileStoreId})
        } else {
            throw new Error("Invalid parameters");
        }
    }
}