'use server';

import { db } from "@/lib/db";
import resolveOldCycles from "./resolveOldCycles";
import { billingCycles } from "@/lib/schemas/schema";
import { generateId } from "better-auth";

export default async function createBillingCycle({userId}:{userId:string}){
    console.log("Creating new billing cycle for user:", userId);
    const latestCycle = await db.query.billingCycles.findFirst({
        where: (billingCycle, {eq, and})=> and(eq(billingCycle.userId, userId), eq(billingCycle.isActive, true)),
        orderBy: (billingCycle, {desc})=> desc(billingCycle.dateStarted),
    });
    let startDate = new Date();
    if (latestCycle){
        if (latestCycle.dateEnded > new Date()){
            throw new Error("Active billing cycle already exists");
        } else if (latestCycle.isActive) {
            await resolveOldCycles({userId});
        }
        startDate =latestCycle.dateEnded;
    }
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const userMeta = await db.query.userMeta.findFirst({
        where: (userMeta, {eq})=> eq(userMeta.userId, userId),
        with: {
            plan: true,
        }
    });
    if (!userMeta || !userMeta.planId || !userMeta.plan) {
        throw new Error("User plan not found");
    }
    const newCycle = await db.insert(billingCycles).values({
        id: generateId(24),
        userId,
        planId: userMeta.planId,
        creditLimit: userMeta.plan.creditLimit,
        dateStarted: startDate,
        dateEnded: endDate,
        isActive: true,
    }).returning();
    console.log("New billing cycle created. Starting:", startDate, "Ending:", endDate, "User ID:", userId);
    return newCycle[0];
}