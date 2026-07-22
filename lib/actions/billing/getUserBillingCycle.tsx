'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import resolveOldCycles from "./resolveOldCycles";
import createBillingCycle from "./createBillingCycle";

export default async function getUserBillingCycle({userId: initialUserId, fromServer}:{userId:string|null, fromServer:boolean}){
    let userId = initialUserId;
    if (!fromServer){
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session || !session.user) {
            throw new Error("Not authenticated");
        }
        userId = session.user.id;
    }
    if (!userId){
        throw new Error("User ID is required");
    }
    await resolveOldCycles({userId});
    let activeCycle = await db.query.billingCycles.findFirst({
        with: {
            usageEvents: true,
        },
        where: (billingCycle, {eq, and})=> and(eq(billingCycle.userId, userId)),
    });
    if (!activeCycle){
        const rawActiveCycle = await createBillingCycle({userId});
        activeCycle = await db.query.billingCycles.findFirst({
            with: {
                usageEvents: true,
            },
            where: (billingCycle, {eq, and})=> and(eq(billingCycle.userId, userId), eq(billingCycle.id, rawActiveCycle.id)),
        });
    }
    return activeCycle;
}