import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { chats } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Chatslayout from "./ChatsLayout";

export default async function Page({params, children}: {params: Promise<{id: string}>, children: React.ReactNode}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })    
    if (!session || !session.user) {
        return redirect("/auth/log-in")
    }
    const { id } = await params;
    const data = (await db.select().from(chats).where(and(eq(chats.userId, session.user.id), eq(chats.classId, id)))).sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());
    return <Chatslayout children={children} chats={data} />
}