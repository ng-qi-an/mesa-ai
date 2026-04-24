'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { account } from "@/lib/schemas/auth-schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function checkIfCredsExists(){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Not authenticated");
    };
    const user = session.user;
    const creds = await db.select().from(account).where(and(eq(account.userId, user.id), eq(account.providerId, "credential")));
    if (creds.length === 0) {
        return false;
    } else {
        return true;
    }
}