import { streamText, Output, UIMessage, convertToModelMessages } from 'ai';
import { google } from "@ai-sdk/google";
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '@/lib/r2';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import createOrExtendCache from '@/lib/cache-actions/createOrExtendCache';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    cacheName: string;
    thinkingLevel: "minimal" | "low" | "medium";
    messages: UIMessage[];
}

export async function POST(req: Request) {
    const context: NotebookRequestType = await req.json();
    
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    if (!context.cacheName){
        throw new Error("Missing cache name");
    }
    console.log("Chatting on notebook with user:", session.user.id, "with cache:", context.cacheName, "and thinking level:", context.thinkingLevel);

    const result = streamText({
        model: google("gemini-3-flash-preview"),
        messages: await convertToModelMessages(context.messages),
        providerOptions: {
            google: {
                thinkingConfig: {
                    thinkingLevel: context.thinkingLevel,
                },
                cachedContent: context.cacheName,
            }
        }
    });

    return result.toUIMessageStreamResponse();
}