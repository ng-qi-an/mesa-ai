'use server';

import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai';
import { headers } from 'next/headers';
import { auth } from '../auth';
import getUserFile from '../r2actions/getUserFile';

export default async function extendCache(cacheName: string, timeToAdd: number = 900){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const cache = await ai.caches.get({name: cacheName});
    if (!cache){
        throw new Error("Cache not found");
    }
    const response = await ai.caches.update({
        name: cacheName,
        config: {
            expireTime: new Date((new Date(cache.expireTime!).getTime()) + (timeToAdd * 1000)).toISOString(),
        },
    });
    return response;
}