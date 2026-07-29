'use client';
import { ChartNoAxesColumn, Menu, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useNotebook } from "@/components/providers/notebook-provider";
import { toast } from "sonner";
import { ChatSelect } from "@/lib/schemas/schema";
import ChatActionsDropdown from "./ChatActionsDropdown";
import { chatModels, ChatUIMessage, freeChatModels, getLowerUsageWarningBoundary, ThinkingLevels, usagePercentageWarnings } from "@/lib/utils/models";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import getChat from "@/lib/actions/chat/getChat";
import { useTabs } from "@/components/providers/tabs-provider";
import ExpandMinimiseButton from "../../(tabbar)/ExpandMinimiseButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import ChatListDrawer from "./ChatListDrawer";
import generateChatUsageEvent from "@/lib/actions/billing/generateChatUsageEvent";
import { useUsage } from "@/components/providers/usage-provider";
import { Progress } from "@/components/ui/progress";
import ChatMessages from "./ChatMessages";

export default function ChatMessagesPanel({chatId: initialChatId, chatName: initialChatName, isMainChat}: {chatId?: string, chatName: string, isMainChat?: boolean}){
    const noteCtx = useNotebook();
    const [chat, setChat] = useState<ChatSelect | null>(null);
    const [chatName, setChatName] = useState<string>(initialChatName);
    const [loadingChat, setLoadingChat] = useState<boolean>(true);
    const [loadingChatName, setLoadingChatName] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<string>(chatModels[0].name);
    const [showChatList, setShowChatList] = useState<boolean>(false);
    const { closeTab, updateTab } = useTabs();
    const { addUsageEvent, usageEvents, billingCycle, getCurrentCreditUsage } = useUsage();
    const [insufficientWarning, setInsufficientWarning] = useState<boolean>(false);

    const onChatFinishRef = useRef< (event: {message: ChatUIMessage; isError: boolean;}) => Promise<void>>(() => Promise.resolve());
    onChatFinishRef.current = async({message, isError})=>{
        if (isError) {
            return;
        }
        if (message.metadata?.totalTokens){
            const usageEvent = await generateChatUsageEvent({totalTokens: message.metadata?.totalTokens, model: message.metadata?.model || selectedModel, chatId: chat?.id!, noteId: noteCtx.noteId});
            console.log("[CHAT STREAM] Usage event generated, totalCredits:", usageEvent.totalCredits);
            if (!freeChatModels.find((model) => model.name === message.metadata?.model)){
                const usagePercentage = [...usageEvents, usageEvent].reduce((acc, event) => acc + parseFloat(event.totalCredits), 0) / billingCycle.creditLimit;
                console.log("[CHAT STREAM] Usage percentage after this event:", usagePercentage);
                if (usagePercentage < usagePercentageWarnings[0]){
                    window.localStorage.removeItem("dismissedUsagePercentage");
                } else {
                    if (typeof window.localStorage.getItem("dismissedUsagePercentage") == "string"){
                        const lastDismissedPercentage = parseFloat(window.localStorage.getItem("dismissedUsagePercentage") as string);
                        const lowerUsageWarningBoundary = getLowerUsageWarningBoundary(usagePercentage);
                        console.log("[CHAT STREAM] Last dismissed usage percentage:", lastDismissedPercentage, "Lower usage warning boundary:", lowerUsageWarningBoundary);
                        if (lowerUsageWarningBoundary > lastDismissedPercentage){
                            setInsufficientWarning(true);
                        }
                    } else {
                        setInsufficientWarning(true);
                    }
                }
            }
            addUsageEvent(usageEvent)
        } else {
            console.log("No totalTokens or user found. Skipping usage event creation.");
        }
    }
    const notebookChat = useMemo(() =>
        new Chat<ChatUIMessage>({
        messages: [],
        transport: new DefaultChatTransport({
            api: "/api/notebook/chat",
        }),
        onFinish: (event) => onChatFinishRef.current(event),
    }), []);
    const { messages, sendMessage, setMessages, status, stop, error, clearError } = useChat<ChatUIMessage>({
        chat: notebookChat,
        experimental_throttle: 100,
    });


    async function fetchChat(chatId: string){
        setLoadingChat(true);
        const result = await getChat(chatId);
        if (!result) {
            toast.error("Failed to load chat. Please close andf try again.");
            setLoadingChat(false);
            return;
        } else {
            console.log("Loaded chat!")
            clearError();
            setChat(result);
            setMessages(result.messages as ChatUIMessage[]);
            setChatName(result.name);
            setLoadingChat(false);
        }
    }
    useEffect(()=>{
        (async()=>{
            if (!initialChatId) {
                setLoadingChat(false);
                return;
            } else {
                await fetchChat(initialChatId);
            }
        })();
    }, [])
    useEffect(()=>{
        if (!chat) return;
        setChatName(chat.name);
        if (isMainChat){
            noteCtx.setMainChatId(chat.id);
        }
    }, [chat])
    useEffect(()=>{
        if (!chat) return;
        updateTab(chat.id, {label: chatName});
    }, [chatName])
    useEffect(()=>{
        if (isMainChat && !noteCtx.mainChatId){
            setChat(null);
            setChatName("New Chat");
            setMessages([]);
            clearError();
        }
    }, [noteCtx.mainChatId])

    return <>
        <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} className={`bg-card h-full flex flex-col pb-3`}>
            <div className="flex items-center h-12 shrink-0 px-3 items-center border-b">
                <div className="flex w-full items-center gap-2">
                    {isMainChat && <><Tooltip> 
                        <TooltipTrigger asChild>
                        <Button onClick={()=> setShowChatList(true)} variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0">
                            <Menu className="size-4"/>
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>View other chats.</p>
                        </TooltipContent>
                    </Tooltip>
                    <ChatListDrawer show={showChatList} setShow={setShowChatList} onChange={(chatId)=>{
                        if (!chatId){
                            noteCtx.setMainChatId(null);
                        } else {
                            fetchChat(chatId);
                        }
                    }} onRename={(chatId, newName)=>{
                        if (noteCtx.mainChatId == chatId){
                            setChatName(newName);
                        } else {
                            updateTab(chatId, {label: newName});
                        }
                    }} onDelete={(chatId)=>{
                        if (noteCtx.mainChatId == chatId){
                            noteCtx.setMainChatId(null);
                        } else {
                            closeTab(chatId);
                        }
                    }}/>
                    </>}
                    {loadingChatName ? <Skeleton className={`${!isMainChat && "ml-2"} w-[50%] mr-auto h-6`}/> :
                    <p className={`text-sm w-full ${!isMainChat && "pl-2"} line-clamp-1`}>
                        {chatName}
                    </p>}
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button disabled={!chat} variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0">
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
                                <p className="w-max">~{Math.floor(usageEvents.reduce((acc, event) => acc + (event.eventSourceId === chat?.id ? parseFloat(event.totalCredits) : 0), 0))} credits</p>
                                <p className="w-max">{Math.floor(getCurrentCreditUsage())} of {billingCycle.creditLimit || 0} credits</p>
                            </div>
                        </div>
                        <Progress value={((getCurrentCreditUsage()/billingCycle.creditLimit) * 100) || 0} className="w-full bg-zinc-700 *:invert *:dark:invert-0 dark:bg-muted dark:invert mt-2"/>
                    </TooltipContent>
                </Tooltip>
                {isMainChat ? <> 
                <Tooltip> 
                    <TooltipTrigger asChild>
                        <Button disabled={messages.length == 0} variant="ghost" size="icon-sm" className={"text-muted-foreground shrink-0"} onClick={()=>{
                            noteCtx.setMainChatId(null);
                        }}>
                            <Plus/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                        <p>Start a new chat. Your chats are still saved.</p>
                    </TooltipContent>
                </Tooltip>
                </>
                :
                <ExpandMinimiseButton tabId={chat?.id}/>}
                <ChatActionsDropdown disabled={!chat} triggerClassName="" chat={chat} onRename={(newName) => {
                    if (chat){
                        setChat({...chat, name: newName});
                        setChatName(newName);
                    }
                }} onDelete={()=>{
                    if (isMainChat){
                        noteCtx.setMainChatId(null);
                    } else {
                        chat && closeTab(chat.id);
                    }
                }}/>
            </div>
            <ChatMessages messages={messages} setMessages={setMessages} sendMessage={sendMessage} error={error} clearError={clearError} status={status} notebookChat={notebookChat} insufficientWarning={insufficientWarning} setInsufficientWarning={setInsufficientWarning} loadingChat={loadingChat} chat={chat} setChat={setChat} selectedModel={selectedModel} setSelectedModel={setSelectedModel}/>
        </motion.div>
    </>
}
