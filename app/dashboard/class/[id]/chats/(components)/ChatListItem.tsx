'use client';
import { ChatSelect } from "@/lib/schemas/schema";
import { Notebook } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import ChatActionsDropdown from "../../notebooks/[noteId]/(components)/(apps)/(chats)/ChatActionsDropdown";
import revalidateData from "@/lib/actions/revalidateData";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChatListItem({chat, active}:{chat: ChatSelect, active?: boolean}){
    const router = useRouter();
    const pathname = usePathname();
    const { chatId } = useParams();
    return <div onClick={()=> !active && router.push(`/dashboard/class/${chat.classId}/chats/${chat.id}`)} className={`gap-2 w-full h-10 flex group cursor-pointer rounded-lg items-center px-3 pr-1 py-1 ${active ? "bg-secondary/50" : "hover:bg-card"}`}>
        <p className="text-sm truncate">{chat.name}</p>
        <div className="flex-1"/>
        {chat.notebookId && <Tooltip>
            <TooltipTrigger asChild>
                <Notebook className="size-4 -mr-8 group-hover:mr-0 text-muted-foreground"/>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p>Chat is from notebook. Notebook chats can only be interacted with in the notebook view.</p>
            </TooltipContent>
        </Tooltip>}
        <div onClick={(e)=> e.stopPropagation()} className="opacity-0 group-hover:opacity-100">
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