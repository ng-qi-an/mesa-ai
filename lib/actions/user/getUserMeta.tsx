"use server";
import { headers } from "next/headers";
import { auth } from "../../auth";
import { userMeta } from "../../schemas/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export default async function getUserMeta() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    const meta = await db.select().from(userMeta).where(eq(userMeta.userId, session.user.id));
    if (!meta || meta.length === 0) {
        const newMeta = await db.insert(userMeta).values({ userId: session.user.id, updateVersion: "unknown" }).returning();
        return newMeta[0];
    }
    return meta[0];
}