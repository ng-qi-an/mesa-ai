"use server";
import { headers } from "next/headers";
import { auth } from "../../auth";
import { userMeta, UserMetaInsert } from "../../schemas/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export default async function updateUserMeta(updateOptions: Partial<UserMetaInsert>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    const meta = await db.update(userMeta).set(updateOptions).where(eq(userMeta.userId, session.user.id)).returning();
    return meta[0].updateVersion;
}