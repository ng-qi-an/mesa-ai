import { streamText, convertToModelMessages, isStepCount, createIdGenerator, toUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { chatModels, ChatUIMessage, convertEffortLevel, fileSearchMetaQuery, ThinkingLevels } from '@/lib/utils/models';
import { availableSubjects } from '@/lib/subjects/subjectsList';
import { searchDocumentsTool } from '@/lib/rag-actions/searchDocumentsTool';
import { db } from '@/lib/db';
import { listDocumentsTool } from '@/lib/rag-actions/listDocumentsTool';
import saveToChat from '@/lib/actions/chat/saveToChat';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    thinkingLevel: ThinkingLevels;
    messages: ChatUIMessage[];
    subject: keyof typeof availableSubjects;
    selectedModel: string;
    chatId: string;
    noteId: string;
}

export async function POST(req: Request) {
    const context: NotebookRequestType = await req.json();
    
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    if (!context.noteId) {
        throw new Error("Notebook ID is required");
    }
    if (!context.subject) {
        throw new Error("Subject is required");
    }
    const raw = await db.query.notebook.findFirst({
        columns: {},
        where: (notebook, {eq, and})=> and(eq(notebook.id, context.noteId), eq(notebook.userId, session.user.id)),
        with: {
            files: {
                with: {
                    file: {
                        columns: {id: true}
                    }
                }
            }
        }
    })
    const files = raw ? raw.files.map(f => f.file) : [];
    console.log("model selected:", context.selectedModel);
    const result = streamText({
        model: context.selectedModel,
        messages: await convertToModelMessages(context.messages),
        tools: {
            listDocuments: listDocumentsTool(files.map(f => f.id)),
            searchDocuments: searchDocumentsTool(files.map(f => f.id)),
        },
        instructions: `
        ${availableSubjects[context.subject].instructions.chat}
        ## File sources
        This chat has been provided with student's notes and slide decks. You should use them to ground your responses when necessary.
        - When the user asks a question related to their documents, use the listDocuments tool first to see what documents are available. As documents can change mid-conversation, use the tool frequently to check for new documents or changes.
        - Then, use the searchDocuments tool to find relevant information. Rephrase search queries to be more specific and relevant. You can break a large search query into multiple smaller queries. Avoid vague words like "summary" or "details" unless paired with topics.
        - If information is found in the documents, use it to answer the user's question. Be sure to cite the source document (by name) of any information you use. Wrap them in inline code block notation: \`[Document Name]\`.
        - Should no relevant information be found, try a broader search query. 
        - If all tool calls are exhausted, answer to the best of your ability with the general information you have. You must mention that your answer may be incomplete.
        `,
        stopWhen: isStepCount(5), // lets the model use tools and continue
        reasoning: context.thinkingLevel,
    });
    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream: result.stream, 
            sendReasoning: true,
            sendSources: true,
        originalMessages: context.messages,
        generateMessageId: createIdGenerator({
            prefix: 'msg-assistant',
            size: 16,
        }),
        onEnd: async({messages, responseMessage}:{messages: ChatUIMessage[], responseMessage: ChatUIMessage})=>{
            console.log("[CHAT STREAM] Stream finished! Saving chat to DB!")
            console.log("assistant message:", responseMessage);
            await saveToChat(context.chatId, { messages });
        },
        messageMetadata: ({part})=>{
            if (part.type == "finish-step"){
                try {
                    console.log("Extracting model from provider metadata");
                    const finalModel = (part.providerMetadata as {gateway: {routing: {modelAttempts: Array<{canonicalSlug: string}>}}}).gateway.routing.modelAttempts.at(-1)!.canonicalSlug
                    const modelAttempts = (part.providerMetadata as {gateway: {routing: {modelAttempts: Array<{canonicalSlug: string}>}}}).gateway.routing.modelAttempts
                    console.log("Final model used:", finalModel, "attempts:", modelAttempts.map((attempt)=> JSON.stringify(attempt)));
                    return {
                        model: finalModel
                    }
                } catch {
                    console.log("Failed to extract model from provider metadata. Default to selected.");
                    return {
                        model: context.selectedModel || chatModels[0].name
                    };
                }
            }
        }})
    })
}