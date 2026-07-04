'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, MessageSquare, MessageSquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotebook } from "@/components/providers/notebook-provider";
import getChatsList from "@/lib/actions/chat/getChatsList";
import { ChatSelect } from "@/lib/schemas/schema";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import createChat from "@/lib/actions/chat/createChat";
import { relativeTime } from "@/lib/utils/relativeTime";
import ChatActionsDropdown from "./ChatActionsDropdown";
import { useParams } from "next/navigation";
import { useTabs } from "@/components/providers/tabs-provider";
import ChatMessagesPanel from "./ChatMessagesPanel";
export default function ChatsPanel({setSidebarTool, chatsList, setChatsList, selectedChatId, setSelectedChatId}: {setSidebarTool: (tool: string) => void, chatsList: ChatSelect[], setChatsList: (chats: ChatSelect[]) => void, selectedChatId: string, setSelectedChatId: (id: string) => void}){
    const noteCtx = useNotebook();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const {addOrGoToTab} = useTabs();
    
    async function syncChatsList(){
        setLoading(true);
        try {
            setChatsList(await getChatsList(noteCtx.noteId))
        } catch {
            toast.error("Failed to load chats. Please refresh and try again.")
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        syncChatsList()
    }, [])

    async function createHandler(){
        setCreating(true);
        try {
            const result = await createChat(id as string, noteCtx.noteId);
            console.log("Created chat:", result);
            setChatsList([...result, ...chatsList]);
            setSelectedChatId(result[0].id);
        } catch (error) {
            toast.error("Failed to create chat. Please try again.")
        } finally {
            setCreating(false);
        }
    }

    return <div className={`bg-card h-full`}>
        <div className="h-full">
            <div className="h-full px-2 pb-2 flex flex-col pt-2 gap-1 overflow-auto">
                {loading ? [...Array(5)].map((_, index) => (
                    <Skeleton className="h-12 my-0.5" key={index}/>
                )) : chatsList.length > 0 ? chatsList.map((chat, index) => 
                    <div onClick={()=> addOrGoToTab({label: chat.name, id: chat.id, component: <ChatMessagesPanel chatId={chat.id} chatName={chat.name} />}, "side")} key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-3 py-2 rounded-md w-full relative">
                        <MessageSquare className="text-muted-foreground group-hover:text-foreground size-4"/>
                        <div className="flex flex-col pl-1">
                            <p className="truncate text-sm w-full font-medium">
                                {chat.name}
                            </p>
                            <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                                {relativeTime(chat.dateModified, {capitalize: true})}
                            </p>
                        </div>
                        <ChatActionsDropdown triggerClassName="inline-block" chat={chat} onRename={()=> syncChatsList()} onDelete={()=> syncChatsList()}/>
                    </div>) : 
                    <Empty>
                        <EmptyHeader>
                        <EmptyMedia variant={"icon"}>
                            <MessageSquare/>
                        </EmptyMedia>
                            <EmptyTitle>Start a new chat</EmptyTitle>
                            <EmptyDescription>Chats allow you to interact with sources through language.</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button onClick={createHandler} disabled={noteCtx.files.length < 1} variant={"secondaryRaised"}><MessageSquarePlus/> Start chatting</Button>
                        </EmptyContent>
                    </Empty>}
            </div>
        </div>
    </div>
}