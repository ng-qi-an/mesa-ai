import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { extractLatestUserText, formatRetrievedContext } from '@/lib/rag/formatContext';
import { retrieveChunks } from '@/lib/rag/retrieveChunks';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
});

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
    if (!context.fileIds || context.fileIds.length === 0) {
        throw new Error("At least one file ID is required");
    }
    const topicWeights = context.topicWeights!

    const queryText = [
        extractLatestUserText(context.messages as Array<{ role?: string; parts?: Array<{ type?: string; text?: string }> }>),
        `Topic weights: ${JSON.stringify(topicWeights)}`,
    ].join("\n");

    const retrievedChunks = await retrieveChunks({
        userId: session.user.id,
        fileIds: context.fileIds,
        query: queryText,
        limit: 28,
    });
    const sourceContext = formatRetrievedContext(retrievedChunks);

    const result = streamText({
        model: openrouter.chat("google/gemini-3-flash-preview"),
        messages: await convertToModelMessages(context.messages),
        system: `Use only the provided source excerpts to write or update the notes.
If a requested detail is not present in the sources, state that clearly and do not fabricate details.

Retrieved Sources:
${sourceContext}`,
    });

    return result.toUIMessageStreamResponse({
        onFinish: async()=>{

        }
    });
}