import { UIMessage } from "ai";
import z from "zod";


export const chatMessageMetadataSchema = z.object({
  model: z.string().optional(),
});

export type ChatMessageMetadata = z.infer<typeof chatMessageMetadataSchema>;
export type ChatUIMessage = UIMessage<ChatMessageMetadata>;


export type Model = {
    name: string;
    label: string;
    provider: "google" | "openrouter" | "gateway";
    timeoutMs?: number;
}

export const chatModels: Model[] = [
    {
        name: "google/gemini-3-flash",
        label: "Gemini 3 Flash",
        provider: "gateway",
    },
    {
        name: "google/gemini-3.1-flash-lite",
        label: "Gemini 3.1 Flash Lite",
        provider: "gateway",
    },
    {
        name: "anthropic/claude-sonnet-4.6",
        label: "Claude Sonnet 4.6",
        provider: "gateway",
    },
    {
        name: "anthropic/claude-haiku-4.5",
        label: "Claude Haiku 4.5",
        provider: "gateway",
    },
    {
        name: "openai/gpt-5.4",
        label: "GPT-5.4",
        provider: "gateway",
    },
    {
        name: "openai/gpt-5.4-mini",
        label: "GPT-5.4 Mini",
        provider: "gateway",
    },
    {
        name: "deepseek/deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        provider: "gateway",
    },
    {
        name: "deepseek/deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        provider: "gateway",
    },
    {
        name: "xai/grok-4.3",
        label: "Grok 4.3",
        provider: "gateway",
    }
];

export const embeddingModel: Model = {
    name: "openai/text-embedding-3-small",
    label: "OpenAI Text Embedding 3 Small",
    provider: "gateway",
}

export const summaryModels: Model[] = [
    {
        name: "google/gemma-4-31b-it:free",
        label: "Gemma 4.31B IT",
        provider: "openrouter",
    },
    {
        name: "google/gemma-4-31b-it",
        label: "Gemma 4.31B IT",
        provider: "openrouter",
    },
    {
        name: "deepseek/deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        provider: "openrouter",
    },
];

export const fileSearchMetaQuery = (fileIds: string[]) => fileIds.map(id => `file_id="${id}"`).join(" OR ");