import { streamText, convertToModelMessages, createIdGenerator, gateway } from 'ai';
import { chatModels, ChatUIMessage, convertEffortLevel, ThinkingLevels } from '@/lib/utils/models';
import { availableSubjects } from '@/lib/subjects/subjectsList';
import saveToChat from '@/lib/actions/quiz/saveToChat';

type ChatRequestType = {
    chatId: string;
    thinkingLevel: ThinkingLevels;
    forceSearch: boolean;
    messages: ChatUIMessage[];
    subject: keyof typeof availableSubjects;
    selectedModel: string;
}

export async function POST(req: Request) {
    const context: ChatRequestType = await req.json();
    if (!context.subject) {
        throw new Error("Subject is required");
    }
    if (!context.chatId) {
        throw new Error("Chat ID is required");
    }
    const result = streamText({
        instructions: `
        ${availableSubjects[context.subject].instructions.chat}
        `,
        model: context.selectedModel || chatModels[0].name,
        messages: await convertToModelMessages(context.messages),
        tools: {
            perplexity_search: gateway.tools.perplexitySearch({
                maxResults: 5,
                country: "SG",

            }),
        },
        providerOptions: {
            gateway: {
                sort: 'cost',
                models: chatModels.filter((model)=> model.name != context.selectedModel).map((model) => model.name),
            },
        },
        reasoning: context.thinkingLevel,
        onEnd: async({totalUsage})=>{
            console.log("[CHAT STREAM] Stream finished with total tokens:", totalUsage.totalTokens);
            // The user usage limit thing should go here
        }
        // tools: model.provider === "google" ? {
        //     google_search: google.tools.googleSearch({}),
        // } : undefined,
        // toolChoice: "auto",
        // providerOptions: model.name.startsWith("gemini-3") ? {
        //     google: {
        //         thinkingConfig: {
        //             thinkingLevel: context.thinkingLevel,
        //             includeThoughts: true,
        //         },
        //     },
        // } : undefined,
        // timeout: {stepMs: model.timeoutMs, totalMs: maxDuration * 1000},
    });
    result.consumeStream(); 
    return result.toUIMessageStreamResponse({
        sendReasoning: true,
        sendSources: true,
        originalMessages: context.messages,
        generateMessageId: createIdGenerator({
            prefix: 'msg-assistant',
            size: 16,
        }),
        onEnd: async({messages, responseMessage})=>{
            console.log("[CHAT STREAM] Stream finished! Saving chat to DB!")
            console.log("assistant message:", responseMessage);
            messages
            responseMessage.parts.filter((part)=> part.type.startsWith("tool")).map((toolPart)=>{
                console.log("Tool part:", JSON.stringify(toolPart, null, 2));
            })
            await saveToChat(context.chatId, { messages });
        },
        messageMetadata: ({part})=>{
            if (part.type == "finish-step"){
                try {
                    console.log("Extracting model from provider metadata");
                    const finalModel = (part.providerMetadata as {gateway: {routing: {modelAttempts: Array<{canonicalSlug: string}>}}}).gateway.routing.modelAttempts.at(-1)!.canonicalSlug
                    console.log("Final model used:", finalModel);
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
        }
    });
}
