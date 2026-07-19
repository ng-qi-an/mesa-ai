'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/schemas/schema";
import constructProvider from "@/lib/utils/constructProvider";
import { summaryModels } from "@/lib/utils/models";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function generateChatName({chatId, message}: {chatId: string, message: string}){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const summaryModelNames = summaryModels.map((model) => model.name);
    const summary = await generateText({
        model: constructProvider(summaryModels[0]).chat(summaryModels[0].name),
        prompt: `Generate a concise name for a chat based on the first message sent by the user. The name should be 3-8 words long, and be grounded in relevance. The name should be a title case, and you can use numbers. You should not include any special characters, punctuation or emojis.\n\n# User message\n${message}`,
        reasoning: "none",
        providerOptions: {
            openrouter: {
            models: summaryModelNames,
            route: "fallback",
            reasoning: {effort: "none"}
            }
        },
    });
    await db.update(chats).set({name: summary.text}).where(eq(chats.id, chatId)).returning();
    return summary.text;
}