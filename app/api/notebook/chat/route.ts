import { streamText, convertToModelMessages, isStepCount, createIdGenerator, toUIMessageStream, createUIMessageStreamResponse, gateway } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { chatModels, ChatUIMessage, ThinkingLevels } from '@/lib/utils/models';
import { availableSubjects } from '@/lib/subjects/subjectsList';
import { searchDocumentsTool } from '@/lib/actions/chat/tools/searchDocumentsTool';
import { db } from '@/lib/db';
import { listDocumentsTool } from '@/lib/rag-actions/listDocumentsTool';
import saveToChat from '@/lib/actions/chat/saveToChat';
import createChatUsageEvent from '@/lib/actions/billing/createChatUsageEvent';
import checkCreditSufficient from '@/lib/actions/billing/checkCreditSufficient';
import { files as filesTable, notebook, notebookFiles } from '@/lib/schemas/schema';
import { and, eq } from 'drizzle-orm';

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
    // Failed UI streams can leave an empty assistant placeholder in persisted history.
    // It contains no model context and must not be sent back on the next request.
    const messages = context.messages.filter((message) => message.role !== "assistant" || message.parts.length > 0);
    
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
    if (!(await checkCreditSufficient({userId: session.user.id, modelName: context.selectedModel}))) {
        return new Response("Insufficient credits", { status: 402 });
    }
    const files = await db.select({
        id: filesTable.id,
        name: filesTable.name,
        summary: filesTable.summary,
    }).from(filesTable)
        .innerJoin(notebookFiles, eq(notebookFiles.fileId, filesTable.id))
        .innerJoin(notebook, eq(notebook.id, notebookFiles.notebookId))
        .where(and(
            eq(notebook.id, context.noteId),
            eq(notebook.userId, session.user.id),
            eq(filesTable.status, "processed"),
        ));
    let finalModel = context.selectedModel || chatModels[0].name;
    const result = streamText({
        model: context.selectedModel,
        messages: await convertToModelMessages(messages),
        tools: {
            listDocuments: listDocumentsTool(files.map(f => f.id)),
            searchDocuments: searchDocumentsTool(files.map(f => f.id)),
            perplexity_search: gateway.tools.perplexitySearch({
                maxResults: 5,
                country: "SG",
            }),
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
        onEnd: async({usage})=>{
            if (usage.totalTokens && usage.totalTokens > 0) {
                const usageEvent = await createChatUsageEvent({
                    totalTokens: usage.totalTokens,
                    userId: session.user.id,
                    model: finalModel,
                    chatId: context.chatId,
                    noteId: context.noteId,
                });
                console.log("[CHAT STREAM] Usage event created, totalCredits", usageEvent.totalCredits);
            }
        }
    });
    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream: result.stream,
            sendReasoning: true,
            sendSources: true,
        originalMessages: messages,
        generateMessageId: createIdGenerator({
            prefix: 'msg-assistant',
            size: 16,
        }),
        onEnd: async({messages, responseMessage}:{messages: ChatUIMessage[], responseMessage: ChatUIMessage})=>{
            console.log("[CHAT STREAM] Stream finished! Saving chat to DB!")
            if (responseMessage.parts.length === 0) {
                return;
            }
            await saveToChat(context.chatId, { messages });
        },
        messageMetadata: ({part})=>{
            if (part.type == "finish-step"){
                try {
                    // console.log("Extracting model from provider metadata");
                    finalModel = (part.providerMetadata as {gateway: {routing: {modelAttempts: Array<{canonicalSlug: string}>}}}).gateway.routing.modelAttempts.at(-1)!.canonicalSlug
                    // const modelAttempts = (part.providerMetadata as {gateway: {routing: {modelAttempts: Array<{canonicalSlug: string}>}}}).gateway.routing.modelAttempts
                    // console.log("Final model used:", finalModel, "attempts:", modelAttempts.map((attempt)=> JSON.stringify(attempt)));
                } catch {
                    console.log("Failed to extract model from provider metadata. Default to selected.");
                }
            }
            if (part.type == "finish"){
                return {
                    model: finalModel,
                    totalTokens: part.totalUsage.totalTokens,
                }
            }
        }})
    })
}
