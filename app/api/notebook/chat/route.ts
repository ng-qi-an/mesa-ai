import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from "@ai-sdk/google";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    fileStoreId: string;
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
    if (!context.fileStoreId){
        throw new Error("Missing file store ID");
    }
    console.log("Messages received in API route:", JSON.stringify(context.messages, null, 2));

    const result = streamText({
        model: google("gemini-3.1-flash-lite-preview"),
        messages: await convertToModelMessages(context.messages),
        tools: {
            file_search: google.tools.fileSearch({fileSearchStoreNames: [context.fileStoreId]}),
        },
        system: `
        You are an assistant for a user who has access to a set of ai-generated notes based on the sources provided with file_search. 
        - Use the file_search tool to access the content of these notes and provide answers to the user's questions based on that content. 
        - If the user asks a question that cannot be answered with the provided notes, say you don't know rather than making something up. 
        - Always use the file_search tool to access the notes when formulating your answer.
        **Math formula**: If you need to use a math formula, use LaTeX format and STRICTLY wrap it in double dollar signs. For example, if you want to express the formula for the area of a circle, you would write: $$A = \pi r^2$$.`,
        providerOptions: {
            google: {
                thinkingConfig: {
                    thinkingLevel: context.thinkingLevel,
                    includeThoughts: true,
                },
            }
        }
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