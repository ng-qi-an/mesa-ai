'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NotebookContext } from "@/lib/contexts";
import { ChevronDown, ChevronLeft, ListTodo, MessageSquare, MessageSquarePlus, Mic, MoreVertical, Plus, WalletCards } from "lucide-react";
import { useContext, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ChatMessagesPanel from "./ChatMessagesPanel";

export default function ChatsPanel({setSidebarTool}: {setSidebarTool: (tool: string) => void}){
    const noteCtx = useContext(NotebookContext);
    const [selectedChat, setSelectedChat] = useState("");
    if (!noteCtx) return null;

    return selectedChat ?
        <ChatMessagesPanel selectedChat={selectedChat} setSelectedChat={setSelectedChat}/>
    : <Card size="sm" className={`rounded-md ring-neutral-900 h-full`}>
        <CardHeader className="items-center group flex cursor-pointer relative">
            <div className="flex w-full items-center gap-1" onClick={()=> setSidebarTool("")}>
                <ChevronLeft className="text-muted-foreground group-hover:text-foreground size-4"/>
                <CardTitle 
                className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                    Chat
                </CardTitle>
            </div>
            <Tooltip >
                <TooltipTrigger asChild>
                    <span className="inline-block w-fit absolute right-4">
                        <Button disabled={noteCtx.files.length < 1} size={'icon-sm'} className="text-muted-foreground" onClick={(e) => setSelectedChat("create")} variant={'ghost'}>
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
            <div className="h-full px-2 pb-2 flex flex-col gap-1 overflow-auto">
                {[...Array(10)].map((_, index) => (
                    <div key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-3 py-2 rounded-md w-full">
                        <MessageSquare className="text-muted-foreground group-hover:text-foreground size-4"/>
                        <div className="flex flex-col pl-1">
                            <p className="truncate text-sm w-full font-medium">
                                Weather Quiz
                            </p>
                            <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                                1 minute ago
                            </p>
                        </div>
                        <Button size={'icon-sm'} className="text-muted-foreground ml-auto" variant={'ghost'}>
                            <MoreVertical/>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    </Card>
}