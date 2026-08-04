import { streamText, convertToModelMessages, createIdGenerator, gateway, stepCountIs, ToolSet, tool } from 'ai';
import { chatModels, ChatUIMessage, ThinkingLevels } from '@/lib/utils/models';
import { availableSubjects } from '@/lib/subjects/subjectsList';
import saveToChat from '@/lib/actions/chat/saveToChat';
import { files, notebook, notebookFiles } from '@/lib/schemas/schema';
import { db } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { searchDocumentsTool } from '@/lib/actions/chat/tools/searchDocumentsTool';
import createChatUsageEvent from '@/lib/actions/billing/createChatUsageEvent';
import checkCreditSufficient from '@/lib/actions/billing/checkCreditSufficient';
import {
  aiDocumentFormats,
  DocumentState,
  injectDocumentStateMessages,
  toolDefinitionsToToolSet,
} from "@blocknote/xl-ai/server";
import constructProvider from '@/lib/utils/constructProvider';
import { openrouter } from '@openrouter/ai-sdk-provider';
import z from 'zod';
import { getDocumentStateTool } from '@/lib/actions/chat/tools/getDocumentState';
import { compactChatHistory } from '@/lib/actions/chat/compactChatHistory';
import { getDocumentMarkdown } from '@/lib/actions/chat/tools/getDocumentMarkdown';


export type ChatRequestOptions = {
    chatId: string;
    noteId?: string;
    classId: string;
    thinkingLevel: ThinkingLevels;
    subject: keyof typeof availableSubjects;
    selectedModel: string;
    documentState?: DocumentState<any>;
    markdown: string;
}
type ChatRequestType = {
    messages: ChatUIMessage[];
    toolDefinitions?: Parameters<typeof toolDefinitionsToToolSet>[0];
}

export const maxDuration = 300

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    const context: ChatRequestType & ChatRequestOptions = await req.json();
    if (!context.subject) {
        throw new Error("Subject is required");
    }
    if (!context.chatId) {
        throw new Error("Chat ID is required");
    }
    if (!context.classId) {
        throw new Error("Class ID is required");
    }
    if (!(await checkCreditSufficient({userId: session.user.id, modelName: context.selectedModel}))) {
        return new Response("Insufficient credits", { status: 402 });
    }
    const messages = compactChatHistory(context.messages).filter((message) => message.role !== "assistant" || message.parts.length > 0);
    let availableFiles: { id: string; name: string; summary: string | null }[] = [];
    if (context.noteId){
        availableFiles = await db.select({id: files.id, name: files.name, summary: files.summary}).from(files)
            .innerJoin(notebookFiles, eq(notebookFiles.fileId, files.id))
            .innerJoin(notebook, eq(notebook.id, notebookFiles.notebookId))
            .where(and(eq(notebook.id, context.noteId), eq(notebook.userId, session.user.id), eq(files.status, "processed")));
    } else {
        availableFiles = await db.select({id: files.id, name: files.name, summary: files.summary}).from(files).where(and(eq(files.userId, session.user.id), eq(files.classId, context.classId), eq(files.status, "processed")));
    }
    const selectedModelObject = chatModels.find((model) => model.name === context.selectedModel) || chatModels[0];
    const result = streamText({
        system: `
        ${availableSubjects[context.subject].instructions.chat}
        # Accessing Notebook content
        As you are an AI alongside with a text editor containing notes, you have access to the 
        user's notebook content.
        - Use the "getDocumentMarkdown" to get a markdown representation of the user's entire notebook content.
        - You should only use the user's content for answering general queries like "summarise my notes", "explain [a particular section]", or "what are the key points in my notes". At no point should you use this tool as context to edit a user's notes.
        - If the user's notes are insufficient, you may use the user's files to supplement your answers, and as a last resort use your general knowledge. You should always cite the source of your information, and if you use your general knowledge, you should indicate that it is not from the user's notes or files.
        - Should the user refer to a specific section of their notes that is not named, such as "summarise this", "rephrase this sentence", "delete this section", you should use the "getDocumentState" tool to get the exact position of the user's cursor and selection. "getDocumentMarkdown" does not provide that information, and should not be used.
        ${context.toolDefinitions ? `
        # Notebook Editing
        You can also manipulate the notebook with HTML blocks. Follow the provided JSON schema
        exactly and use every block ID exactly as returned, including its trailing $.
        - When manipulating notebook content, you should use "getDocumentState" instead of "getDocumentMarkdown" to get the latest blocknote editor document state.
        - "getDocumentMarkdown" only contains the markdown representation of the notebook, and does not contain any information about the block IDs, selection, or cursor context.
        - You should only use "getDocumentMarkdown" for general queries, and not for editing the notebook.
        - "getDocumentState" contains block ids, exact html formatting, and cursor queries, which are all required when editing the notebook.
        ## Formatting instructions
        - List items are one block per item:
        <ul><li>item1</li></ul> is valid;
        <ul><li>item1</li><li>item2</li></ul> is not.
        - For code blocks, use <pre><code data-language="...">...</code></pre>.
        - Tables must be standalone <table> blocks. Never wrap a table in <p>,
        <div>, or a list item.

        Only edit the notebook when the user explicitly asks to write, rewrite, add,
        delete, move, reorganize, or format content. Otherwise answer normally.

        Before calling applyDocumentOperations, call getDocumentState in the
        current request. Treat its result as the only authoritative source for content,
        cursor context, selection, and editable IDs. Never reuse IDs from an earlier
        message or tool result.

        When selection is true:
        - Only edit IDs in selectedBlocks.
        - blocks is context only; do not edit or reference it.
        - Do not modify content outside the selection.

        When selection is false:
        - Use IDs from blocks.
        - The block marked cursor: true is the current insertion context.
        - For “below” or “after”, add content after the current or named block.
        - For “above” or “before”, add content before the relevant block.

        For ordinary table text edits, update the existing table block.

        For structural table changes, including adding/removing columns or rows,
        merging/splitting cells, or changing layout:
        1. Do not update the existing table directly.
        2. Add a complete replacement <table> immediately after the original table.
        3. Delete the original table in the same applyDocumentOperations call.
        4. Always add the replacement before deleting the original table.

        When editing:
        1. Write one short acknowledgement of the intended change.
        2. Call applyDocumentOperations in the same response.
        3. Do not wait for the tool result or send a second follow-up afterward.
        ` : ""}
        # Other tools
        ## File search
        Aside from the web and your own knowledge, you have access to the user's files.
        - You will be given a list of files each with IDs, names and a short summary. Use the summary as context for search queries.
        - You can use the "searchDocuments" tool to search the user's files using short queries (3-5 words) based on the summary.
        - Only search the user's files to answer questions when relevant. Your answers should be based on the content of the files, and you should cite the file name when referencing information from the files.
        ### File list
        ${availableFiles.map((file) => `- ${file.name} (ID: ${file.id}) - ${file.summary || "No summary available"}`).join("\n")}
        `,
        providerOptions: {
            gateway: {
                models: chatModels.filter((model) => model.name !== context.selectedModel).map((model) => model.name),
            },
            openrouter: {
                reasoning: {
                    effort: context.thinkingLevel,
                }
            }
        },
        model: constructProvider(selectedModelObject).chat(selectedModelObject.name),
        messages: await convertToModelMessages(messages),
        tools: {
            ...(selectedModelObject.provider == "gateway" ? { 
                perplexity_search: gateway.tools.perplexitySearch({
                    maxResults: 5,
                    country: "SG",
                })
            } : selectedModelObject.provider == "openrouter" ? {
                perplexity_search: openrouter.tools.webSearch({
                    engine: "perplexity",
                    maxResults: 5,
                    execute: ()=>{
                        console.log("using search")
                    }
                }),
            } as ToolSet : {}),
            ...(context.toolDefinitions && context.documentState ? {
                getDocumentState: getDocumentStateTool(context.documentState),
            } : {}),
                getDocumentMarkdown: getDocumentMarkdown(context.markdown),
                searchDocuments: searchDocumentsTool(availableFiles.map(f => f.id)),
            ...(context.toolDefinitions && toolDefinitionsToToolSet(context.toolDefinitions)),
        },
        stopWhen: stepCountIs(5), // lets the model use tools and continue
        // reasoning: context.thinkingLevel,
        onFinish: async({totalUsage: usage})=>{
            console.log("[CHAT STREAM] Total input:", usage.inputTokenDetails)
            console.log("[CHAT STREAM] Total output:", usage.outputTokenDetails)
            console.log("[CHAT STREAM] Raw usage:", usage.raw)
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

    let finalModel = context.selectedModel || chatModels[0].name;
    return result.toUIMessageStreamResponse<ChatUIMessage>({
        sendReasoning: true,
        sendSources: true,
        originalMessages: messages,
        generateMessageId: createIdGenerator({
            prefix: "msg-assistant",
            size: 16,
        }),
        onFinish: async ({
            messages,
            responseMessage,
        }: {
            messages: ChatUIMessage[];
            responseMessage: ChatUIMessage;
        }) => {
            console.log("[CHAT STREAM] Stream finished! Saving chat to DB!");

            if (responseMessage.parts.length === 0) {
            return;
            }

            await saveToChat(context.chatId, { messages });
        },
        messageMetadata: ({ part }) => {
            if (part.type === "finish-step") {
            try {
                finalModel = (
                part.providerMetadata as {
                    gateway: {
                        routing: {
                            modelAttempts: Array<{ canonicalSlug: string }>;
                        };
                    };
                }
                ).gateway.routing.modelAttempts.at(-1)!.canonicalSlug;
            } catch {
                console.log(
                "Failed to extract model from provider metadata. Default to selected.",
                );
            }
            }

            if (part.type === "finish") {
            return {
                model: finalModel,
                totalTokens: part.totalUsage.totalTokens,
            };
            }
        },
    });
    // return createUIMessageStreamResponse({
    //     stream: toUIMessageStream({
    //         stream: result.stream,
    //         sendReasoning: true,
    //         sendSources: true,
    //     originalMessages: messages,
    //     generateMessageId: createIdGenerator({
    //         prefix: 'msg-assistant',
    //         size: 16,
    //     }),
    //     onEnd: async({messages, responseMessage}:{messages: ChatUIMessage[], responseMessage: ChatUIMessage})=>{
    //         console.log("[CHAT STREAM] Stream finished! Saving chat to DB!")
    //         if (responseMessage.parts.length === 0) {
    //             return;
    //         }
    //         await saveToChat(context.chatId, { messages });
    //     },
    //     messageMetadata: ({part})=>{
    //         if (part.type == "finish-step"){
    //             try {
    //                 // console.log("Extracting model from provider metadata");
    //                 finalModel = (part.providerMetadata as {gateway: {routing: {modelAttempts: Array<{canonicalSlug: string}>}}}).gateway.routing.modelAttempts.at(-1)!.canonicalSlug
    //                 // const modelAttempts = (part.providerMetadata as {gateway: {routing: {modelAttempts: Array<{canonicalSlug: string}>}}}).gateway.routing.modelAttempts
    //                 // console.log("Final model used:", finalModel, "attempts:", modelAttempts.map((attempt)=> JSON.stringify(attempt)));
    //             } catch {
    //                 console.log("Failed to extract model from provider metadata. Default to selected.");
    //             }
    //         }
    //         if (part.type == "finish"){
    //             return {
    //                 model: finalModel,
    //                 totalTokens: part.totalUsage.totalTokens,
    //             }
    //         }
    //     }})
    // })
}
