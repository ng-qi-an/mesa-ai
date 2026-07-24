import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/schemas/schema";
import constructProvider from "@/lib/utils/constructProvider";
import { summaryModels } from "@/lib/utils/models";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

// Allow responses up to 5 minutes
export const maxDuration = 300;

export async function POST(req: Request) {
    const { chatId, message }: { chatId: string; message: string } = await req.json();

    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (!chatId || !message) {
        return Response.json({ error: "chatId and message are required" }, { status: 400 });
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
                reasoning: { effort: "none" }
            }
        },
    });
    await db.update(chats).set({ name: summary.text }).where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id))).returning();
    return Response.json({ name: summary.text });
}
