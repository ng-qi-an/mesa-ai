'use server';

import { db } from "@/lib/db";
import { billingCycles } from "@/lib/schemas/schema";
import { and, eq, lt } from "drizzle-orm";

export default async function resolveOldCycles({userId}:{userId:string}){
    return await db.update(billingCycles).set({isActive: false}).where(and(eq(billingCycles.userId, userId), lt(billingCycles.dateEnded, new Date())));
}