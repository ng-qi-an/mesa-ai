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
    topicWeights?: Record<string, number>;
    cacheName: string;
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
    if (!context.topicWeights){
        throw new Error("Missing topic weights");
    }
    const topicWeights = context.topicWeights!

    console.log("Using topic weights:", topicWeights);
    console.log("Using cache:", context.cacheName);
    console.log("Generating notes for user:", session.user.id);

    const result = streamText({
        model: google(process.env.NOTEBOOK_AI_MODEL!),
        messages: await convertToModelMessages(context.messages),
        providerOptions: {
            google: {
                thinkingConfig: {
                    thinkingLevel: "minimal",
                    // thinkingBudget: 0
                },
                cachedContent: context.cacheName,
            }
        }
    });

    return result.toUIMessageStreamResponse();
}