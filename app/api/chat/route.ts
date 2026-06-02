import { streamText, convertToModelMessages } from 'ai';
import { chatModels, ChatUIMessage } from '@/lib/utils/models';
import { availableSubjects } from '@/lib/subjects/subjectsList';

type ChatRequestType = {
    thinkingLevel: "minimal" | "low" | "medium";
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
    const result = streamText({
        system: `
        ${availableSubjects[context.subject].instructions.chat}
        `,
        model: context.selectedModel || chatModels[0].name,
        messages: await convertToModelMessages(context.messages),
        providerOptions: {
            gateway: {
                sort: 'cost',
                models: chatModels.filter((model)=> model.name != context.selectedModel).map((model) => model.name),
            },

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
    return result.toUIMessageStreamResponse({
        sendReasoning: true,
        sendSources: true,
        originalMessages: context.messages,
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
