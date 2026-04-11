'use server';
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizzes } from "@/lib/schemas/schema";

export default async function renameQuiz(quizId: string, newName: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    await db.update(quizzes).set({name: newName, dateModified: new Date()}).where(and(eq(quizzes.userId, session.user.id), eq(quizzes.id, quizId))).returning()
    
}