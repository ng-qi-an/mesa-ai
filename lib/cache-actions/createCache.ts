'use server';

import { createPartFromUri, createUserContent, File, GoogleGenAI } from '@google/genai';
import { r2 } from '../r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { headers } from 'next/headers';
import { auth } from '../auth';
import getUserFile from '../r2actions/getUserFile';
export default async function createCache(files: string[], ttl: number = 720){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const filesMap = files.map(async(key) => {
        const file = await getUserFile(key);
        if (!file.data || !file.ContentType) {
            throw new Error(`Failed to load file: ${key}`);
        }
        let cacheFile: File | undefined;
        try {
            cacheFile = await ai.files.get({name: `user-files/${session.user.id}/${key}`});
        } catch {
            const blob = new Blob([new Uint8Array(file.data)], { type: file.ContentType });
            cacheFile = await ai.files.upload({
                file: blob,
                config: { displayName: key, mimeType: file.ContentType },
            });
        }
        if (!cacheFile || !cacheFile.uri || !cacheFile.mimeType) {
            throw new Error(`Failed to upload file: ${key}`);
        }
        return cacheFile;
    });

    const cacheFiles = await Promise.all(filesMap);
    const cache = await ai.caches.create({
        model: "gemini-3-flash-preview",
        config: {
            contents: createUserContent(cacheFiles.map(file => createPartFromUri(file.uri!, file.mimeType!))),
            ttl: `${ttl}s`,
        },
    });
    console.log(cache.expireTime);
    return cache;
}