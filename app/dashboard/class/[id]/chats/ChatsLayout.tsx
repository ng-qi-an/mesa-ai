'use client';
import PageHeader from "../(components)/PageHeader";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, MessageSquare, MessageSquarePlus } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { ChatSelect } from "@/lib/schemas/schema";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import ChatListItem from "./(components)/ChatListItem";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import { ChatProvider } from "@/components/providers/chat-provider";
import { groupedTime } from "@/lib/utils/groupedTime";
import { motion } from "motion/react";
import { chatModels, ThinkingLevels } from "@/lib/utils/models";
export default function ChatsLayout({children, chats}: {chats: ChatSelect[], children: React.ReactNode}){
    const {id, chatId} = useParams();
    const router = useRouter();
    const {isMobile, setOpen} = useSidebar();
    
    const [newText, setNewText] = useState("");
    const [newFiles, setNewFiles] = useState<ChatAttachmentType[]>([]);
    const [newThinkingLevel, setNewThinkingLevel] = useState<ThinkingLevels>("low");
    const [newSelectedModel, setNewSelectedModel] = useState(chatModels[0].name);
    const [showChatList, setShowChatList] = useState(!isMobile);

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
    useEffect(()=>{
        if (isMobile){
            setShowChatList(false);
        } else {
            setShowChatList(true);
        }
    }, [isMobile, chatId])
    return <div className="flex h-screen w-full overflow-x-hidden">
        <motion.div 
            layout
            initial={{
                width: isMobile ? 0 : "17rem",
                opacity: isMobile ? 0 : 1
            }}
            animate={{
                width: !showChatList ? 0 : "17rem",
                opacity: !showChatList ? 0 : 1
            }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="shrink-0 flex flex-col border-r h-screen"
        >
            <div className="flex items-center h-16 shrink-0 px-4 border-b">
                <SidebarTrigger/>
                <p onClick={()=> router.push(`/dashboard/class/${id}/chats`)} className="ml-2 cursor-pointer font-medium hover:text-foreground/70">Chats</p>
            </div>
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
        </motion.div>
        <div className="flex flex-col min-w-screen sm:min-w-0 w-full h-screen overflow-hidden">
            <PageHeader sidebarButton={<Button onClick={()=> setShowChatList(!showChatList)} variant={"ghost"} size={"icon-sm"} className={`-ml-1 mr-1 ${showChatList ? "" : "rotate-180"} transition-all`}>
                <ChevronsLeft/>
            </Button>} pages={[{name: chatId ? chats.find(c => c.id === chatId)?.name || "New Chat" : "New Chat"}]} actionsClassName="ml-auto">
                <Button variant={isMobile ? "ghost" : "secondary"} size={isMobile ? "icon" : "default"} className="mr-2" onClick={async()=>{
                    router.push(`/dashboard/class/${id}/chats`);
                }}>{!isMobile && "Create new"}<MessageSquarePlus/></Button>
            </PageHeader>
            <ChatProvider value={{newText, setNewText, newFiles, setNewFiles, newThinkingLevel, setNewThinkingLevel, newSelectedModel, setNewSelectedModel}}>
                <div className="w-full flex-1 min-h-0 flex flex-col">
                    {children}
                </div>
            </ChatProvider>
        </div>
    </div>
}