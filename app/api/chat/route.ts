import { streamText, convertToModelMessages } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { chatModels, ChatUIMessage, Model } from '@/lib/utils/models';
import { availableSubjects } from '@/lib/subjects/subjectsList';

const maxDuration = 180;

type ChatRequestType = {
    thinkingLevel: "minimal" | "low" | "medium";
    forceSearch: boolean;
    chatModelIndex?: number;
    messages: ChatUIMessage[];
    subject: keyof typeof availableSubjects;
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

function createChatStream({model, context, messages}: {model: Model; context: ChatRequestType; messages: Awaited<ReturnType<typeof convertToModelMessages>>}) {
    return streamText({
        system: `
        ${availableSubjects[context.subject].instructions.chat}
        `,
        model: openrouter.chat(chatModels[0].name, {models: chatModels.map(m => m.name), reasoning: {
            effort: context.thinkingLevel,
        }}),
        messages,
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
}


export async function POST(req: Request) {
    const context: ChatRequestType = await req.json();
    if (!context.subject) {
        throw new Error("Subject is required");
    }
    const messages = await convertToModelMessages(context.messages);
    const modelIndex = Number.isInteger(context.chatModelIndex) ? Number(context.chatModelIndex) : 0;
    const model = chatModels[modelIndex];
    if (!model) {
        return new Response("Invalid model index", { status: 400 });
    }
    console.log("Using model:", model.name, "with provider:", model.provider, "and thinking level:", context.thinkingLevel);
    const result = createChatStream({
        model,
        context,
        messages,
    });

    return result.toUIMessageStreamResponse({
        sendReasoning: true,
        sendSources: true,
        originalMessages: context.messages,
        messageMetadata: ({part})=>{
            if (part.type == "start-step"){
                return {
                    model: model.name
                }
            }
        }
    });
}
