'use client';
import { Input } from "@/components/ui/input";
import PageHeader from "../(components)/PageHeader";
import { Button } from "@/components/ui/button";
import { MessageSquare, MessageSquarePlus, NotebookPen } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ChatSelect } from "@/lib/schemas/schema";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import ChatListItem from "./(components)/ChatListItem";
import createChat from "@/lib/actions/chat/createChat";
import { useSidebar } from "@/components/ui/sidebar";
import { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import { ChatProvider } from "@/components/providers/chat-provider";
import { groupedTime } from "@/lib/utils/groupedTime";

export default function ChatsLayout({children, chats}: {chats: ChatSelect[], children: React.ReactNode}){
    const {id, chatId} = useParams();
    const router = useRouter();
    const {isMobile, setOpen} = useSidebar();
    
    const [newText, setNewText] = useState("");
    const [newFiles, setNewFiles] = useState<ChatAttachmentType[]>([]);
    const [newThinkingLevel, setNewThinkingLevel] = useState("minimal");

    const groupedChats = groupedTime(chats, chats.map((chat) => chat.dateModified));

    useEffect(()=>{
        if (chatId){
            console.log("Chat ID from params:", chatId);
        }
    }, [chatId])

    useEffect(()=>{
        if (!isMobile){
            setOpen(false);
        }
        return()=>{
            if (!isMobile){
                setOpen(true);
            }
        }
    }, [])
    return <div className="flex h-screen w-full">
        <div className="flex flex-col sm:min-w-[17rem] sm:max-w-[17rem] border-r h-screen">
            <p onClick={()=> router.push(`/dashboard/class/${id}/chats`)} className="cursor-pointer flex items-center shrink-0 h-16 px-6 font-medium border-b hover:text-foreground/70">Chats</p>
            <div className="flex flex-col px-3 py-4 pt-4 h-full gap-1 overflow-auto h-full">
                {chats.length > 0 ? <>
                <div onClick={()=> router.push(`/dashboard/class/${id}/chats`)} className={`w-full flex gap-3 group cursor-pointer rounded-lg items-center px-3 pr-1 py-1 h-10 shrink-0 mb-3 ${!chatId ? "bg-secondary/50" : "hover:bg-card"}`}>
                    <MessageSquarePlus className="size-4"/>
                    <p className="text-sm truncate">New chat</p>
                    <div onClick={(e)=> e.stopPropagation()} className="ml-auto opacity-0 group-hover:opacity-100">
                    </div>
                </div>
                {groupedChats.map((grp, index)=>(
                    <Fragment key={grp.key}>
                        <p className={`text-xs font-medium text-muted-foreground px-3 mb-1 ${index > 0 && "mt-4"}`}>{grp.label}</p>
                        {grp.items.map((chat) => (
                            <ChatListItem key={chat.id} active={chat.id == chatId} chat={chat} />
                        ))}
                    </Fragment>
                ))}
                </> :  <Empty className="max-w-7xl px-0">
                    <EmptyMedia variant={"icon"} className="mb-0">
                        <MessageSquare />
                    </EmptyMedia>
                    <EmptyHeader>
                        <EmptyDescription>Conversations with Mesa will appear here.</EmptyDescription>
                    </EmptyHeader>
                </Empty>}
            </div>
        </div>
        <div className="flex flex-col w-full h-screen overflow-hidden">
            <PageHeader pages={[{name: chatId ? chats.find(c => c.id === chatId)?.name || "New Chat" : "New Chat"}]} actionsClassName="ml-auto">
                <Input className="w-full max-w-[300px] mr-1 border-0 px-3" placeholder="Search for chats"/>
                <Button variant={"secondary"} className="mr-2" onClick={async()=>{
                    router.push(`/dashboard/class/${id}/chats`);
                }}>Create new<MessageSquarePlus/></Button>
            </PageHeader>
            <ChatProvider value={{newText, setNewText, newFiles, setNewFiles, newThinkingLevel, setNewThinkingLevel}}>
                <div className="w-full flex-1 min-h-0 flex flex-col">
                    {children}
                </div>
            </ChatProvider>
        </div>
    </div>
}