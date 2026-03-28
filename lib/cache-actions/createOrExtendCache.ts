'use server';

import { CachedContent, GoogleGenAI } from '@google/genai';
import { headers } from 'next/headers';
import { auth } from '../auth';
import extendCache from './extendCache';
import createCache from './createCache';
export default async function createOrExtendCache(cacheName: string, fileIds: string[], ttl: number = 900){
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
        const result = await ai.caches.get({name: cacheName});
        console.log("Existing cache expire time:", new Date(result.expireTime!).toISOString());
        console.log("Current time:", new Date().toISOString());
        console.log("Time until cache expires (seconds):", (new Date(result.expireTime!).getTime() - new Date().getTime()) / 1000);

        if (result.expireTime && ((new Date(result.expireTime).getTime() - new Date().getTime()) / 1000) < 300) {
            console.log("Extending cache:", cacheName);
            cache = await extendCache(cacheName, ttl);
        } else {
            console.log("Cache not expiring, cache will not extend cache:", cacheName);
            return result
        }
    } catch (e) {
        console.log("Creating new cache as cache not found or expired:", cacheName);
        cache = await createCache(fileIds, ttl);
    }
    return cache;
}