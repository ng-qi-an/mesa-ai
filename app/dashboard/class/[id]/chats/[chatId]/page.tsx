import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ChatPage from "./ChatPage";

export default async function Page({params}: {params: Promise<{chatId: string, id: string}>}){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    const { chatId, id } = await params;
    const data = await db.query.chats.findFirst({where: (chat, {eq, and}) => and(eq(chat.userId, session?.user.id!), eq(chat.id, chatId), eq(chat.classId, id))});
    if (!data){
        return redirect(`/dashboard/class/${id}/chats`);
    }
    return <ChatPage key={data.id} chat={data} />
}