'use client';
import { ChatSelect } from "@/lib/schemas/schema";
import { relativeTime } from "@/lib/utils/relativeTime";
import { MessageSquare } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import ChatActionsDropdown from "../../notebooks/[noteId]/(components)/(apps)/(chats)/ChatActionsDropdown";
import revalidateData from "@/lib/actions/revalidateData";

export default function ChatListItem({chat, active}:{chat: ChatSelect, active?: boolean}){
    const router = useRouter();
    const pathname = usePathname();
    const { chatId } = useParams();
    return <div onClick={()=> !active && router.push(`/dashboard/class/${chat.classId}/chats/${chat.id}`)} className={`w-full flex gap-3 group cursor-pointer rounded-lg items-center px-3 pr-1 py-1 ${active ? "bg-secondary/50" : "hover:bg-card"}`}>
        <p className="text-sm truncate">{chat.name}</p>
        <div onClick={(e)=> e.stopPropagation()} className="ml-auto opacity-0 group-hover:opacity-100">
            <ChatActionsDropdown chat={chat} onRename={async()=> await revalidateData(pathname)} onDelete={async()=> {
                if (chatId && chatId === chat.id){
                    await revalidateData(`/dashboard/class/${chat.classId}/chats`);
                    router.push(`/dashboard/class/${chat.classId}/chats`);
                } else {
                    await revalidateData(pathname)
                }
            }}/>
        </div>
    </div>
}