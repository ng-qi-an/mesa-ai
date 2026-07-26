'use client';
import PageHeader from "../(components)/PageHeader";
import { Button } from "@/components/ui/button";
import { ChartNoAxesColumn, ChevronsLeft, MessageSquare, MessageSquarePlus } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useUsage } from "@/components/providers/usage-provider";
import ChatActionsDropdown from "../notebooks/[noteId]/(components)/(apps)/(chats)/ChatActionsDropdown";
import revalidateData from "@/lib/actions/revalidateData";
export default function ChatsLayout({children, chats}: {chats: ChatSelect[], children: React.ReactNode}){
    const {id, chatId} = useParams();
    const router = useRouter();
    const {isMobile, setOpen} = useSidebar();
    
    const [newText, setNewText] = useState("");
    const [newFiles, setNewFiles] = useState<ChatAttachmentType[]>([]);
    const [newThinkingLevel, setNewThinkingLevel] = useState<ThinkingLevels>("low");
    const [newSelectedModel, setNewSelectedModel] = useState(chatModels[0].name);
    const [showChatList, setShowChatList] = useState(!isMobile);
    const [loadingChatName, setLoadingChatName] = useState<boolean>(false);
    
    const { usageEvents, billingCycle, getCurrentCreditUsage } = useUsage();
    const groupedChats = groupedTime(chats, chats.map((chat) => chat.dateModified));
    const pathname = usePathname();

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
                            <ChatListItem loadingChatName={loadingChatName} key={chat.id} active={chat.id == chatId} chat={chat} />
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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button disabled={!chatId} variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0">
                            <ChartNoAxesColumn className="size-4"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <div className="flex mt-1">
                            <div className="flex flex-col items-start gap-1">
                                <p className="w-max">This chat:</p>
                                <p className="w-max">Total:</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <p className="w-max">~{Math.floor(usageEvents.reduce((acc, event) => acc + (event.eventSourceId === chatId ? parseFloat(event.totalCredits) : 0), 0))} credits</p>
                                <p className="w-max">{Math.floor(getCurrentCreditUsage())} of {billingCycle.creditLimit || 0} credits</p>
                            </div>
                        </div>
                        <Progress value={((getCurrentCreditUsage()/billingCycle.creditLimit) * 100) || 0} className="w-full bg-zinc-700 *:invert *:dark:invert-0 dark:bg-muted dark:invert mt-2"/>
                    </TooltipContent>
                </Tooltip>
                <ChatActionsDropdown disabled={!chatId} triggerClassName="" chat={chats.find(c => c.id === chatId)} onRename={async () => {
                    await revalidateData(pathname);
                }} onDelete={async () => {
                    await revalidateData(pathname);
                }}/>
                <Button variant={isMobile ? "ghost" : "secondary"} size={isMobile ? "icon" : "default"} className="mr-2" onClick={async()=>{
                    router.push(`/dashboard/class/${id}/chats`);
                }}>{!isMobile && "Create new"}<MessageSquarePlus/></Button>
            </PageHeader>
            <ChatProvider value={{newText, setNewText, newFiles, setNewFiles, newThinkingLevel, setNewThinkingLevel, newSelectedModel, setNewSelectedModel, loadingChatName, setLoadingChatName}}>
                <div className="w-full flex-1 min-h-0 flex flex-col">
                    {children}
                </div>
            </ChatProvider>
        </div>
    </div>
}