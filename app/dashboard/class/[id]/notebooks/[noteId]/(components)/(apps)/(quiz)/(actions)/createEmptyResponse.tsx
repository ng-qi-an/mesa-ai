"use server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizResponses, QuizResponseSelect } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { headers } from "next/headers";
import getQuizResponsesList from "./getQuizResponsesList";

export default async function createEmptyResponse(quizId: string, responses: QuizResponseSelect[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const r = await db.insert(quizResponses).values({
        id: generateId(12),
        quizId: quizId,
        userId: session.user.id,
        respondedQuestions: [],
        completedQuiz: false,
    }).returning();
    return [...responses, r[0]];

}