import { UIMessage } from "ai";
import z from "zod";


export const chatMessageMetadataSchema = z.object({
  model: z.string().optional(),
});

export type ChatMessageMetadata = z.infer<typeof chatMessageMetadataSchema>;
export type ChatUIMessage = UIMessage<ChatMessageMetadata>;


export type Model = {
    name: string;
    provider: "google" | "openrouter";
    timeoutMs?: number;
}

export const chatModels: Model[] = [
    {
        name: "gemini-3-flash-preview",
        provider: "google",
        timeoutMs: 15000,
    },
    {
        name: "gemini-2.5-flash",
        provider: "google",
        timeoutMs: 30000,
    },
    {
        name: "openai/gpt-5.1-chat",
        provider: "openrouter",
    },
];