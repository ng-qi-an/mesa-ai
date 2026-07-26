'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import resolveOldCycles from "./resolveOldCycles";
import createBillingCycle from "./createBillingCycle";

export default async function getUserBillingCycle(initialUserId?: string) {
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
    console.log("Fetching user billing cycle for User ID:", userId);
    await resolveOldCycles({userId});
    let activeCycle = await db.query.billingCycles.findFirst({
        with: {
            usageEvents: true,     
            plan: true,
        },
        where: (billingCycle, {eq, and})=> and(eq(billingCycle.userId, userId)),
    });
    if (!activeCycle){
        console.log("Invoking createBillingCycle for User ID:", userId);
        const rawActiveCycle = await createBillingCycle({userId});
        activeCycle = await db.query.billingCycles.findFirst({
            with: {
                usageEvents: true,
                plan: true,
            },
            where: (billingCycle, {eq, and})=> and(eq(billingCycle.userId, userId), eq(billingCycle.id, rawActiveCycle.id)),
        });
    }
    return activeCycle;
}