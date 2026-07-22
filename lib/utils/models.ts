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
    provider: "openrouter" | "gateway";
    noThinking?: boolean;
    noFiles?: boolean;
    priceMultiplier?: number;
    timeoutMs?: number;
}

export type ThinkingLevels = "minimal" | "low" | "medium" | "high" | "xhigh";

export function convertEffortLevel(provider: string, model: string, level: ThinkingLevels): string {
    switch (level) {
        case "minimal":
            if (provider == "anthropic"){
                return "low";
            } else if (model == "google/gemini-3.1-pro-preview"){
                return "low";
            }
            return "minimal";
        case "low":
            if (provider == "anthropic"){
                return "low";
            }
            return "low";
        case "medium":
            return "medium";
        case "high":
            return "high";
        case "xhigh":
            if (provider == "google"){
                return "high";
            }
            return "xhigh";
    }
}

export const chatModels: Model[] = [
    {
        name: "google/gemini-3-flash",
        label: "Gemini 3 Flash",
        priceMultiplier: 1,
        provider: "gateway",
    },
    {
        name: "google/gemini-3.5-flash-lite",
        label: "Gemini 3.5 Flash Lite",
        noThinking: false,
        priceMultiplier: 0.5,
        provider: "gateway",
    },
    {
        name: "google/gemini-3.6-flash",
        label: "Gemini 3.6 Flash",
        priceMultiplier: 2,
        provider: "gateway",
    },
    {
        name: "google/gemini-3.1-pro",
        label: "Gemini 3.1 Pro",
        priceMultiplier: 4,
        provider: "gateway",
    },
    {
        name: "anthropic/claude-haiku-4.5",
        label: "Claude Haiku 4.5",
        noThinking: true,
        priceMultiplier: 2,
        provider: "gateway",
    },
    {
        name: "anthropic/claude-sonnet-4.6",
        label: "Claude Sonnet 4.6",
        priceMultiplier: 4,
        provider: "gateway",
    },
    {
        name: "anthropic/claude-opus-4.7",
        label: "Claude Opus 4.7",
        priceMultiplier: 9,
        provider: "gateway",
    },
    {
        name: "openai/gpt-5.5",
        label: "GPT-5.5",
        priceMultiplier: 10,
        provider: "gateway",
    },
    {
        name: "openai/gpt-5.4",
        label: "GPT-5.4",
        priceMultiplier: 5,
        provider: "gateway",
    },
    {
        name: "openai/gpt-5.4-mini",
        label: "GPT-5.4 Mini",
        priceMultiplier: 1.5,
        provider: "gateway",
    },
    {
        name: "deepseek/deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        priceMultiplier: 0,
        noFiles: true,
        provider: "gateway",
    },
    {
        name: "deepseek/deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        priceMultiplier: 1.5,
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