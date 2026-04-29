import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { fileSearchMetaQuery } from '@/lib/utils/models';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    topicWeights?: Record<string, number>;
    fileStoreId: string;
    fileIds: string[];
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
    if (!context.fileStoreId) {
        throw new Error("File store ID is required");
    }
    if (!context.fileIds || context.fileIds.length === 0) {
        throw new Error("At least one file ID is required");
    }
    const topicWeights = context.topicWeights!

    console.log("Using topic weights:", topicWeights);
    console.log("Using file store:", context.fileStoreId);
    console.log("Generating notes for user:", session.user.id);
    console.log("Meta query", context.fileIds.map(id => `file_id="${id}"`).join(" OR "));
    const result = streamText({
        model: google("gemini-3-flash-preview"), // "google/gemini-3-flash-preview",
        messages: await convertToModelMessages(context.messages),
        tools: {
            file_search: google.tools.fileSearch({fileSearchStoreNames: [context.fileStoreId], metadataFilter: fileSearchMetaQuery(context.fileIds)}),
        },
        providerOptions: {
            google: {
                thinkingConfig: {
                    thinkingLevel: "minimal",
                    // thinkingBudget: 0
                },
            } satisfies GoogleGenerativeAIProviderOptions
        }
    });

    return result.toUIMessageStreamResponse({
        onFinish: async()=>{

        }
    });
}