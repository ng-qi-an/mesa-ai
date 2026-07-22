import { db } from "@/lib/db";
import { plans } from "@/lib/schemas/schema";
import { eq } from "drizzle-orm";

export default async function getAllPlans({status="all"}:{status?:string}){
    return await db.select().from(plans).where(status === "all" ? eq(plans.status, status) : undefined);
}