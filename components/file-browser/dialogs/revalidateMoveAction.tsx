'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { files, FileSelect } from "@/lib/schemas/schema";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";

export default async function revalidateBrowserInnerAction(nests: FileSelect[], classId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const outerNestId = nests[nests.length - 1]?.id;
    const userFiles = await db.select().from(files).where(and(eq(files.userId, session.user.id), eq(files.classId, classId), (outerNestId && outerNestId != "drive") ? eq(files.parentId, outerNestId) : isNull(files.parentId)));
    return userFiles;
}