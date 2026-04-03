'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizResponses, quizzes } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function getQuizResponsesList(quizId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    return (await db.select().from(quizResponses).where(eq(quizResponses.quizId, quizId))).sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());
}