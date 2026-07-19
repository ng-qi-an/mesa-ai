'use client';
import { Maximize, Maximize2, Menu, Minimize2, Plus } from "lucide-react";
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
import { chatModels, ChatUIMessage, ThinkingLevels } from "@/lib/utils/models";
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
    const { messages, sendMessage, setMessages, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/notebook/chat',
        }),
        messages: [] as ChatUIMessage[],
        throttle: 100,
        onFinish: async ({messages}) => {
            setMessages(messages);
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
            setChat(result);
            setMessages(result.messages as ChatUIMessage[]);
            setChatName(result.name);
            setLoadingChat(false);
        }
    }
    useEffect(()=>{
        if (!initialChatId) {
            setLoadingChat(false);
            return;
        } else {
            fetchChat(initialChatId);
        }
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
                </div>
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
                            </ConversationContent>
                            <ConversationScrollButton />
                        </Conversation>
                        }
                   </motion.div>
                }
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
                        // setCacheLoading(true);
                        // let newCache;
                        // console.log(noteCtx.files)
                        // try {
                        //     if (!noteCtx.cache || !checkCacheMatch(noteCtx.cache.fileIds, noteCtx.files.map(f=>f.id))){
                        //         console.log("[CHAT] Cache files differ from provided files or no cache. Creating cache...");
                        //         newCache = await createCache(noteCtx.files.map(f=>f.id), 600)
                        //     } else {
                        //         console.log("[CHAT] Cache files match provided files. Extending cache...");
                        //         newCache = await createOrExtendCache(noteCtx.cache.name, noteCtx.files.map(f=>f.id), 600)
                        //     }
                        // } catch (err) {
                        //     console.error("Error creating/extending cache:", err);
                        //     setCacheLoading(false);
                        //     setText(oldText);
                        //     return;
                        // }
                        // console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
                        // noteCtx.setCache(newCache.name!, noteCtx.files.map(f=>f.id));
                        // await SaveToNotebook(noteCtx.noteId, {cache: {name: newCache.name!, fileIds: noteCtx.files.map(f=>f.id)}});

                        const r = await SendChatMessage({message, files, sendMessage, thinkingLevel, selectedModel, chatId: chatId, bodyOptions: {noteId: noteCtx.noteId, subject: _class.subject}});
                        console.log("SendChatMessage result:", r);
                        if (r == "success"){
                            console.log("Current messages length", messages.length);
                            if (messages.length == 0){
                                setLoadingChatName(true);
                                const name = await generateChatName({chatId, message: message.text});
                                if (name) {
                                    setChatName(name);
                                    setChat((c)=> c ? {...c, name} : c);
                                }
                                setLoadingChatName(false);
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
                    className="mt-4 px-2"
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
        </motion.div>
    </>
}