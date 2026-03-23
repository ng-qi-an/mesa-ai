'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, MessageSquare, MessageSquarePlus, MoreVertical, Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotebook } from "@/components/providers/notebook-provider";
import getChatsList from "./getChatsList";
import { ChatSelect } from "@/lib/schemas/schema";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import createChat from "./createChat";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { relativeTime } from "@/lib/utils/relativeTime";
export default function ChatsPanel({setSidebarTool, chatsList, setChatsList, selectedChatId, setSelectedChatId}: {setSidebarTool: (tool: string) => void, chatsList: ChatSelect[], setChatsList: (chats: ChatSelect[]) => void, selectedChatId: string, setSelectedChatId: (id: string) => void}){
    const noteCtx = useNotebook();
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    
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
            const result = await createChat(noteCtx.noteId);
            console.log("Created chat:", result);
            setChatsList([...result, ...chatsList]);
            setSelectedChatId(result[0].id);
        } catch (error) {
            toast.error("Failed to create chat. Please try again.")
        } finally {
            setCreating(false);
        }
    }

    return <Card size="sm" className={`rounded-md ring-neutral-900 h-full`}>
        <CardHeader className="items-center group flex cursor-pointer relative">
            <div className="flex w-full items-center gap-1" onClick={()=> setSidebarTool("")}>
                <ChevronLeft className="text-muted-foreground group-hover:text-foreground size-4"/>
                <CardTitle 
                className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                    Chat
                </CardTitle>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-block w-fit absolute right-4">
                        <Button disabled={noteCtx.files.length < 1 || loading || creating} size={'icon-sm'} className="text-muted-foreground" onClick={createHandler} variant={'ghost'}>
                            <MessageSquarePlus/>
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">
                    {noteCtx.files.length > 0 ? <p>New chat</p> : <p>Chats can't be created without sources.</p>}
                </TooltipContent>
            </Tooltip>
        </CardHeader>
        <div className="h-full">
            <Separator className="mb-2" />
            <div className="h-full px-2 pb-2 flex flex-col pt-2 gap-1 overflow-auto">
                {loading ? [...Array(5)].map((_, index) => (
                    <Skeleton className="h-12 my-0.5" key={index}/>
                )) : chatsList.length > 0 ? chatsList.map((chat, index) => 
                    <div onClick={()=> setSelectedChatId(chat.id)} key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-3 py-2 rounded-md w-full relative">
                        <MessageSquare className="text-muted-foreground group-hover:text-foreground size-4"/>
                        <div className="flex flex-col pl-1">
                            <p className="truncate text-sm w-full font-medium">
                                {chat.name}
                            </p>
                            <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                                {relativeTime(chat.dateModified, {capitalize: true})}
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size={'icon-sm'} onClick={(e)=> e.stopPropagation()} className="text-muted-foreground ml-auto absolute right-3" variant={'ghost'}>
                                    <MoreVertical/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><Pencil/> Rename</DropdownMenuItem>
                                <DropdownMenuItem variant="destructive"><Trash/> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
    </Card>
}