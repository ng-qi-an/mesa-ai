'use server';

import { GoogleGenAI } from "@google/genai";
import getStoreFiles from "./getStoreFiles";

export default async function deleteStoreFiles(fileStoreId: string, fileIds: string[]){
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const filesToDelete = (await getStoreFiles(fileStoreId)).raw.filter((rawFile) => fileIds.includes(rawFile.displayName!.replace("user-files-", ""))).map(f=>f.name!);
    await Promise.all(filesToDelete.map(async (fileName) => {
        await ai.fileSearchStores.documents.delete({
            name: fileName,
            config: {
                force: true, // Force delete to remove from store immediately
            }
        })
    }));

    return (await getStoreFiles(fileStoreId)).ids;
}