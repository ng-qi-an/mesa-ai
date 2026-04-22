"use server";
import { headers } from "next/headers";
import { auth } from "../auth";
import { userMeta } from "../schemas/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export default async function getUserUpdateVersion(newestVersion: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    const meta = await db.select({ updateVersion: userMeta.updateVersion }).from(userMeta).where(eq(userMeta.userId, session.user.id));
    if (!meta || meta.length === 0) {
        await db.insert(userMeta).values({ userId: session.user.id, updateVersion: "unknown" });
        return newestVersion;
    }
    return meta[0].updateVersion;
}