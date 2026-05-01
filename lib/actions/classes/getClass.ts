'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export default async function getClassServer(classId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    const _class =  await db.query.classes.findFirst({
        where: (classes, { and, eq }) => and(eq(classes.userId, session.user.id), eq(classes.id, classId)),
        with: {
            topics: true
        }
    })
    return _class;
    //return (await db.select().from(classes).where(and(eq(classes.userId, session.user.id), eq(classes.id, classId))))[0];
}