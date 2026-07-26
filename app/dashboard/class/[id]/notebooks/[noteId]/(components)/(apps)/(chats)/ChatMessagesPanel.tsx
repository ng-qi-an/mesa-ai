'use client';
import { AlertCircleIcon, ChartNoAxesColumn, Maximize, Maximize2, Menu, Minimize2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "@/components/logo";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

import { Message, MessageContent } from "@/components/ai-elements/message";
import { MessageSquareIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useNotebook } from "@/components/providers/notebook-provider";
import { Shimmer } from "@/components/ai-elements/shimmer";
import ChatInputFooter from "@/components/chat/ChatInputFooter";
import SendChatMessage, { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import { toast } from "sonner";
import { ChatSelect } from "@/lib/schemas/schema";
import ChatInputHeader from "@/components/chat/ChatInputHeader";
import ChatMessageContent from "@/components/chat/ChatMessageContent";
import ChatActionsDropdown from "./ChatActionsDropdown";
import { allowedMimeTypes } from "@/lib/utils";
import { useClass } from "@/components/providers/class-provider";
import { chatModels, ChatUIMessage, freeChatModels, getLowerUsageWarningBoundary, ThinkingLevels, usagePercentageWarnings } from "@/lib/utils/models";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import getChat from "@/lib/actions/chat/getChat";
import createChat from "@/lib/actions/chat/createChat";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useTabs } from "@/components/providers/tabs-provider";
import ExpandMinimiseButton from "../../(tabbar)/ExpandMinimiseButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import generateChatName from "@/lib/actions/chat/generateChatName";
import { Skeleton } from "@/components/ui/skeleton";
import ChatListDrawer from "./ChatListDrawer";
import generateChatUsageEvent from "@/lib/actions/billing/generateChatUsageEvent";
import { authClient } from "@/lib/auth-client";
import { useUsage } from "@/components/providers/usage-provider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import checkCreditSufficient from "@/lib/actions/billing/checkCreditSufficient";

export default function ChatMessagesPanel({chatId: initialChatId, chatName: initialChatName, isMainChat}: {chatId?: string, chatName: string, isMainChat?: boolean}){
    const noteCtx = useNotebook();
    const {_class} = useClass();
    const [text, setText] = useState<string>("");
    const [chat, setChat] = useState<ChatSelect | null>(null);
    const [chatName, setChatName] = useState<string>(initialChatName);
    const [loadingChat, setLoadingChat] = useState<boolean>(true);
    const [loadingChatName, setLoadingChatName] = useState<boolean>(false);
    const [files, setFiles] = useState<ChatAttachmentType[]>([]);
    const [previousFiles, setPreviousFiles] = useState<ChatAttachmentType[]>([]);
    const [previousText, setPreviousText] = useState<string>("");
    const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevels>("low");
    const [selectedModel, setSelectedModel] = useState<string>(chatModels[0].name);
    const [showChatList, setShowChatList] = useState<boolean>(false);
    const { closeTab, updateTab } = useTabs();
    const { addUsageEvent, usageEvents, billingCycle, getCurrentCreditUsage, creditUsagePercentage } = useUsage();
    const [insufficentWarning, setInsufficentWarning] = useState<boolean>(false);
    const { messages, sendMessage, setMessages, status, stop, error, clearError } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
        messages: [] as ChatUIMessage[],
        throttle: 100,
        onFinish: async ({message, isError}) => {
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
                                setInsufficentWarning(true);
                            }
                        } else {
                            setInsufficentWarning(true);
                        }
                    }
                }
                addUsageEvent(usageEvent)
            } else {
                console.log("No totalTokens or user found. Skipping usage event creation.");
            }
        }
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
        if (creditUsagePercentage >= 1){
            setSelectedModel(freeChatModels[0].name);
        }
        if (creditUsagePercentage < usagePercentageWarnings[0]){
            window.localStorage.removeItem("dismissedUsagePercentage");
        } else {
            if (typeof window.localStorage.getItem("dismissedUsagePercentage") == "string"){
                const lastDismissedPercentage = parseFloat(window.localStorage.getItem("dismissedUsagePercentage") as string);
                const lowerUsageWarningBoundary = getLowerUsageWarningBoundary(creditUsagePercentage);
                if (lowerUsageWarningBoundary > lastDismissedPercentage){
                    setInsufficentWarning(true);
                }
            } else {
                setInsufficentWarning(true);
            }
        }
    }, [creditUsagePercentage])
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
            <div className="flex-1 min-h-0 flex flex-col px-1">
                {loadingChat ? <>
                <div className="flex-1"/></>
                : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col overflow-auto">
                        {(status == "ready" && messages.length === 0) ? 
                            <Empty className="h-full px-0">
                                <EmptyHeader>
                                    <EmptyMedia variant={"icon"}>
                                        <MessageSquareIcon/>
                                    </EmptyMedia>
                                    <EmptyTitle>Chat</EmptyTitle>
                                    <EmptyDescription>Use me to write notes or ask questions. Messages appear here.</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        : <Conversation className="relative min-h-0 h-full">
                            <ConversationContent>
                                {messages.map((message, index) => (
                                !(messages.length -1 == index && message.role == "assistant" && message.parts.length == 0) && <Message from={message.role} key={message.id}>
                                    <ChatMessageContent
                                        message={message as ChatUIMessage}
                                        isLastMessage={index === messages.length - 1}
                                        isStreaming={status =="streaming"}
                                    />
                                </Message>
                                ))}
                                {status == "submitted" || (status == "streaming" && (messages.length > 1 && messages.at(-1)!.role == "assistant" && messages.at(-1)!.parts.length == 0))  && <Message from="assistant">
                                    <MessageContent className="flex flex-row items-center gap-3">
                                        <Logo type="favicon" className="size-4 invert" />
                                        <Shimmer>
                                            Analysing..
                                        </Shimmer>
                                    </MessageContent>
                                </Message>}
                                {status == "error" && <Message from="assistant">
                                    <Alert variant="destructive" className="w-full">
                                        <AlertCircleIcon />
                                        <AlertTitle>{error?.message == "Insufficient credits" ? "Insufficient credits" : "An error occurred"}</AlertTitle>
                                        <AlertDescription className="w-full">
                                            <p>{error?.message == "Insufficient credits" ? "Use a free model, or upgrade your plan." : "An unknown error occurred. Please try again."}</p>
                                        </AlertDescription>
                                    </Alert>
                                </Message>}
                            </ConversationContent>
                            <ConversationScrollButton />
                        </Conversation>
                        }
                   </motion.div>
                }
                <div className="relative mt-2 px-2">
                    <div className="w-full mb-2">
                        {insufficentWarning && <div className="w-full h-full rounded-lg bg-neutral-900 border flex items-center px-3 py-2 gap-2">
                            <ChartNoAxesColumn className="size-4 shrink-0 text-muted-foreground"/>
                            <p className="text-sm text-muted-foreground">You've used <span className="text-foreground/80 font-medium">{creditUsagePercentage >= 1 ? "100%" : Math.floor(creditUsagePercentage * 100) + "%"}</span> of your credits. {creditUsagePercentage >= 1 ? "Use free models or upgrade your plan." : creditUsagePercentage >= 0.9 ? "Consider using cheaper models." : creditUsagePercentage >= 0.75 ? "Consider using cheaper models." : creditUsagePercentage >= 0.5 && "Consider using less reasoning."}</p>
                            <X className="size-4 shrink-0 text-muted-foreground hover:text-foreground ml-auto cursor-pointer" onClick={()=> {
                                setInsufficentWarning(false)
                                const lowerUsageWarningBoundary = getLowerUsageWarningBoundary(creditUsagePercentage);
                                window.localStorage.setItem("dismissedUsagePercentage", lowerUsageWarningBoundary.toString())
                            }}/>
                        </div>}
                    </div>
                    <PromptInput
                        globalDrop
                        multiple
                        accept={allowedMimeTypes.join(",")}
                        onSubmit={async(message: PromptInputMessage) => {
                            if (!message.text.trim() || status == "submitted" || status == "streaming"){
                                return;
                            }
                            let chatId = chat?.id;
                            if (!chat) {
                                const newChat = await createChat(_class.id, noteCtx.noteId);
                                if (!newChat) {
                                    toast.error("Failed to create chat. Please try again.");
                                    setMessages([]);
                                    return;
                                }
                                setChat(newChat[0]);
                                chatId = newChat[0].id;
                            };
                            if (!chatId) {
                                toast.error("Failed to send message. Please try again.");
                                setMessages([]);
                                return;
                            }

                            setMessages((x)=> x.filter((m, i)=> !(m.role == "user" && i == x.length - 1)))
                            const oldText = text;
                            const oldFiles = files;
                            setPreviousFiles(files);
                            setPreviousText(text);
                            setFiles([]);
                            setText("");
                            clearError();
                            const r = await SendChatMessage({message, files, sendMessage, thinkingLevel, selectedModel, classId: _class.id, chatId: chatId, bodyOptions: {noteId: noteCtx.noteId, subject: _class.subject}});
                            console.log("SendChatMessage result:", r);
                            if (r == "success"){
                                console.log("Current messages length", messages.length);
                                if (messages.length == 0){
                                    (async()=>{
                                        setLoadingChatName(true);
                                        const name = await generateChatName({chatId, message: message.text});
                                        if (name) {
                                            setChatName(name);
                                            setChat((c)=> c ? {...c, name} : c);
                                        }
                                        setLoadingChatName(false);
                                    })();
                                }
                            }  else if (r === "failed_uploads") {
                                toast.warning("Some files failed to upload.");
                            } else if (r === "error") {
                                setText(oldText);
                                setFiles(oldFiles);
                                toast.error("Error sending message. Please try again.");
                            }
                            // setCacheLoading(false);
                        }}
                    >
                        {files.length > 0 && <ChatInputHeader files={files} setFiles={setFiles} />}
                        <PromptInputBody>
                            <PromptInputTextarea
                            placeholder="What would you like to do today?"
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                            />
                        </PromptInputBody>
                        <ChatInputFooter selectedModel={selectedModel} setSelectedModel={setSelectedModel} files={files} setFiles={setFiles} text={text} thinkingLevel={thinkingLevel} setThinkingLevel={setThinkingLevel} 
                            onStop={()=>{
                                stop();
                                setText(previousText);
                                setFiles(previousFiles);
                            }}
                            disableSend={status === "submitted" || status == "streaming"}
                            disableStop={false}
                        />
                    </PromptInput>
                </div>
            </div>
        </motion.div>
    </>
}
