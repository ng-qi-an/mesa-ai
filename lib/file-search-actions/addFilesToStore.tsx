'use server';

import { headers } from "next/headers";
import { auth } from "../auth";
import { File, GoogleGenAI } from "@google/genai";
import getUserFileContent from "../r2actions/files/getUserFileContent";
import { db } from "../db";
import { files } from "../schemas/schema";
import { eq } from "drizzle-orm";
import getStoreFiles from "./getStoreFiles";

export default async function addFilesToStore(fileIds: string[], fileStoreId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    try {
        console.log("Fetching file store with ID:", fileStoreId);
        await ai.fileSearchStores.get({name: fileStoreId})
    } catch (e) {
        console.log("Error fetching file store:", e);
        throw new Error("File store not found");
    }
    const ops = await Promise.all(fileIds.map(async(id) => {

        let storeFile: File | undefined;
        console.log("Uploading file: user-files/", id)
        try {
            storeFile = await ai.files.get({name: `user-files-${id}`});
            console.log("File found:", storeFile.name);
        } catch {
            const file = await getUserFileContent(id);
            if (!file.data || !file.ContentType) {
                throw new Error(`Failed to load file: ${id}`);
            }
            console.log("File not found in Google GenAI, uploading file:", id);
            const blob = new Blob([new Uint8Array(file.data)], { type: file.ContentType });
            storeFile = await ai.files.upload({
                file: blob,
                config: { name: `user-files-${id}`, mimeType: file.ContentType },
            });
            console.log("Uploaded file to Google GenAI:", storeFile.name);
        }
        const fileData = await db.select({name: files.name, id: files.id}).from(files).where(eq(files.id, id))
        console.log("Storefile name", storeFile.name)
        return await ai.fileSearchStores.importFile({
            config: {
                customMetadata: [{
                    key: 'file_name',
                    stringValue: fileData[0].name
                }, {
                    key: "file_id",
                    stringValue: fileData[0].id
                }]
            },
            fileSearchStoreName: fileStoreId,
            fileName: storeFile.name!
        });
    }))
    const importStartTime = Date.now();
    const importTimeoutMs = 20_000;

    while (ops.some(op => !op.done)) {
        if (Date.now() - importStartTime > importTimeoutMs) {
            throw new Error(`Timed out waiting for file imports after ${importTimeoutMs / 1000} seconds`);
        }
        await Promise.all(ops.map(async (op, index) => {
            if (!op.done) {
                ops[index] = await ai.operations.get({operation: op});
            }
        }))
        console.log("Checking file import status:", ops.map(op => ({name: op.name,done: op.done})));
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return (await getStoreFiles(fileStoreId)).ids;
}