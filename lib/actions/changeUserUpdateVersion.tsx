"use server";
import { headers } from "next/headers";
import { auth } from "../auth";
import { userMeta } from "../schemas/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export default async function changeUserUpdateVersion(newestVersion: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    const meta = await db.update(userMeta).set({ updateVersion: newestVersion }).where(eq(userMeta.userId, session.user.id)).returning();
    return meta[0].updateVersion;
}