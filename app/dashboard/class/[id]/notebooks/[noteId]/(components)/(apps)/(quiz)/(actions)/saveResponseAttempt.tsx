'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizResponses, QuizResponseSelect, quizzes } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function saveResponseAttempt(responseId:string, payload: Partial<QuizResponseSelect>, responses: QuizResponseSelect[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const r = await db.update(quizResponses).set({...payload, dateModified: new Date()}).where(eq(quizResponses.id, responseId)).returning();
    return responses.map((response)=> response.id === responseId ? r[0] : response);
}