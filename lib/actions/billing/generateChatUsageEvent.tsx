'use server';
import { UsageEventSelect } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import getUserBillingCycle from "./getUserBillingCycle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { convertToCredits } from "./convertToCredits";

export default async function generateChatUsageEvent({totalTokens, userId:initialUserId, model: modelName, chatId, noteId}:{totalTokens:number, userId?:string, model:string, chatId:string, noteId?:string}){
    let userId = initialUserId;
    if (!userId){
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session || !session.user) {
            throw new Error("Not authenticated");
        }
        userId = session.user.id;
    }
    const billingCycle = await getUserBillingCycle(userId);
    if (!billingCycle){
        throw new Error("No active billing cycle found for user");
    }
    const totalCredits = convertToCredits({totalTokens, plan: billingCycle.plan, modelName});
    return {
        id: generateId(24),
        userId: userId,
        eventType: "chat",
        eventSourceId: chatId,
        eventData: {
            fromNotebook: noteId ? true : false,
            noteId: noteId,
        },
        billingCycleId: billingCycle.id,
        totalCredits: totalCredits.toString(),
    } as UsageEventSelect;
}