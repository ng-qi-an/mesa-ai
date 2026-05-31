import { UIMessage } from "ai";
import z from "zod";


export const chatMessageMetadataSchema = z.object({
  model: z.string().optional(),
});

export type ChatMessageMetadata = z.infer<typeof chatMessageMetadataSchema>;
export type ChatUIMessage = UIMessage<ChatMessageMetadata>;


export type Model = {
    name: string;
    provider: "google" | "openrouter" | "gateway";
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

export const embeddingModel: Model = {
    name: "openai/text-embedding-3-small",
    provider: "gateway",
}

export const summaryModels: Model[] = [
    {
        name: "google/gemma-4-31b-it:free",
        provider: "openrouter",
    },
    {
        name: "google/gemma-4-31b-it",
        provider: "openrouter",
    },
    {
        name: "deepseek/deepseek-v4-flash",
        provider: "openrouter",
    },
];

export const fileSearchMetaQuery = (fileIds: string[]) => fileIds.map(id => `file_id="${id}"`).join(" OR ");