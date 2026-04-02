'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizzes } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function getQuizList(notebookId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    return (await db.select().from(quizzes).where(and(eq(quizzes.notebookId, notebookId), eq(quizzes.userId, session.user.id)))).sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());
}