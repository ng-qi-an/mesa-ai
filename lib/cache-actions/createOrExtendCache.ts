'use server';

import { CachedContent, GoogleGenAI } from '@google/genai';
import { headers } from 'next/headers';
import { auth } from '../auth';
import extendCache from './extendCache';
import createCache from './createCache';
export default async function createOrExtendCache(cacheName: string, files: string[], ttl: number = 720){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    let cache:CachedContent;
    try {
        await ai.caches.get({name: cacheName});
        console.log("Extending cache:", cacheName);
        cache = await extendCache(cacheName, ttl);
    } catch (e) {
        console.log("Creating new cache as cache not found or expired:", cacheName);
        cache = await createCache(files, ttl);
    }
    return cache;
}