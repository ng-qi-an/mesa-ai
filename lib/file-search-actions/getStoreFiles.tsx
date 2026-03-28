'use server';

import { GoogleGenAI } from "@google/genai";

export default async function getStoreFiles(fileStoreId: string){
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const documents = await ai.fileSearchStores.documents.list({
        parent: fileStoreId
    });
    return { ids: documents.page.map(doc=> doc.displayName!.replace("user-files-", "")), raw: documents.page};
}