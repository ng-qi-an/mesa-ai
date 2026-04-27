import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { availableSubjects } from '@/lib/subjects/subjectsList';
import { extractLatestUserText, formatRetrievedContext } from '@/lib/rag/formatContext';
import { retrieveChunks } from '@/lib/rag/retrieveChunks';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
});

type NotebookRequestType = {
    fileStoreId: string;
    fileIds: string[];
    thinkingLevel: "minimal" | "low" | "medium";
    messages: UIMessage[];
    subject: keyof typeof availableSubjects;
}

export async function POST(req: Request) {
    const context: NotebookRequestType = await req.json();
    
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    if (!context.fileIds || context.fileIds.length === 0) {
        throw new Error("At least one file ID is required");
    }
    if (!context.subject) {
        throw new Error("Subject is required");
    }
    const userQuery = extractLatestUserText(context.messages as Array<{ role?: string; parts?: Array<{ type?: string; text?: string }> }>);
    const retrievedChunks = await retrieveChunks({
        userId: session.user.id,
        fileIds: context.fileIds,
        query: userQuery,
        limit: 14,
    });
    const sourceContext = formatRetrievedContext(retrievedChunks);

    const result = streamText({
        model: openrouter.chat("google/gemini-3-flash-preview", {
            reasoning: {
                effort: context.thinkingLevel,
            },
        }),
        messages: await convertToModelMessages(context.messages),
        system: `
        ${availableSubjects[context.subject].instructions.chat}
        This chat has been provided with student's source notes as retrieved excerpts.
        - Answer using only the sources below.
        - If the answer is not present in the sources, say you do not know based on the provided notes.
        - Prefer concise, accurate answers and cite source file names when useful.

        Retrieved Sources:
        ${sourceContext}

        **Math formula**: If you need to use a math formula, use LaTeX format and STRICTLY wrap it in double dollar signs. For example, if you want to express the formula for the area of a circle, you would write: $$A = \pi r^2$$.`,
    });

    return result.toUIMessageStreamResponse({
        sendReasoning: true,
        sendSources: true,
        originalMessages: context.messages,
        messageMetadata: ({part})=>{
            if (part.type == "start-step"){
                return {
                    model: "gemini-3-flash-preview",
                }
            }
        }
    });
}