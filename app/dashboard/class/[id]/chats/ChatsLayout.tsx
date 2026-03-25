'use client';
import { Input } from "@/components/ui/input";
import PageHeader from "../(components)/PageHeader";
import { Button } from "@/components/ui/button";
import { MessageSquare, MessageSquarePlus, NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";
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

export default function ChatsLayout({children, chats}: {chats: ChatSelect[], children: React.ReactNode}){
    const {id, chatId} = useParams();
    const router = useRouter();
    const {isMobile, setOpen} = useSidebar();
    
    const [newText, setNewText] = useState("");
    const [newFiles, setNewFiles] = useState<ChatAttachmentType[]>([]);
    const [newThinkingLevel, setNewThinkingLevel] = useState("minimal");

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
        <div className="flex flex-col sm:min-w-[16rem] sm:max-w-[16rem] border-r h-full">
            <p onClick={()=> router.push(`/dashboard/class/${id}/chats`)} className="cursor-pointer flex items-center shrink-0 h-16 px-6 font-medium border-b">Chats</p>
            <div className="flex flex-col px-3 py-4 pt-4 h-full gap-1">
                {chats.length > 0 ? <>
                <p className="text-sm font-medium text-muted-foreground px-3 mb-2">Today</p>
                {chats.map((chat)=>{
                    return <ChatListItem key={chat.id} active={chat.id == chatId} chat={chat} />
                })}
                </> :  <Empty className="max-w-7xl px-0">
                    <EmptyMedia variant={"icon"}>
                        <MessageSquare />
                    </EmptyMedia>
                    <EmptyHeader>
                        <EmptyTitle className="text-lg">No chats yet</EmptyTitle>
                        <EmptyDescription>Conversations with Mesa will appear here.</EmptyDescription>
                    </EmptyHeader>
                </Empty>}
            </div>
        </div>
        <div className="flex flex-col w-full h-screen overflow-hidden">
            <PageHeader pages={[{name: "New chat"}]} actionsClassName="ml-auto">
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