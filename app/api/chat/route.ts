import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from "@ai-sdk/google";


type ChatRequestType = {
    thinkingLevel: "minimal" | "low" | "medium";
    messages: UIMessage[];
}
export const maxDuration = 300;


export async function POST(req: Request) {
  const context: ChatRequestType = await req.json();
  const result = streamText({
        model: google("gemini-3-flash-preview"),
        messages: await convertToModelMessages(context.messages),
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
    });
}