'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronLeft, Cloud, ListTodo, MessageSquare, MessageSquarePlus, Mic, MoreVertical, Pencil, Plus, Square, Trash, Upload, WalletCards } from "lucide-react";
import { cacheSignal, useContext, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "@/components/logo";
import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";

import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { MessageSquareIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, FileUIPart } from "ai";
import { text } from "stream/consumers";
import createOrExtendCache from "@/lib/cache-actions/createOrExtendCache";
import createCache from "@/lib/cache-actions/createCache";
import { useNotebook } from "@/components/providers/notebook-provider";
import checkCacheMatch from "../../../(actions)/checkCacheMatch";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Spinner } from "@/components/ui/spinner";
import MessageParts from "./MessageParts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ChatInputFooter from "./ChatInputFooter";
import ChatInputAttachments from "./ChatInputAttachments";
import SendChatMessage from "./sendChatMessage";
import { toast } from "sonner";
import { ChatSelect } from "@/lib/schemas/schema";

export default function ChatMessagesPanel({setSelectedChatId, chat}: {selectedChat: string, setSelectedChatId: (chat: string) => void, chat: ChatSelect}){
    const noteCtx = useNotebook();
    const [text, setText] = useState<string>("");
    const [files, setFiles] = useState<(FileUIPart & {id: string})[]>([]);
    const [previousText, setPreviousText] = useState<string>("");
    const [thinkingLevel, setThinkingLevel] = useState("minimal");
    const { messages, sendMessage, setMessages, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/notebook/chat',
        }),
        messages: chat.messages,
    }); 
    useEffect(()=>{
        console.log(messages)
        console.log(messages.map(m=> m.parts.filter(p=> p.type == "reasoning").join("\n\n")).join("\n----\n"))
    }, [messages])
    const [cacheLoading, setCacheLoading] = useState(false);

    return <>
        <Card size="sm" className={`rounded-md ring-neutral-900 h-full pb-2!`}>
            <CardHeader className="items-center group flex cursor-pointer relative">
                <div className="flex w-full items-center gap-1" onClick={()=> setSelectedChatId("")}>
                    <ChevronLeft onClick={()=> setSelectedChatId("")} className="text-muted-foreground group-hover:text-foreground size-4"/>
                    <CardTitle 
                    className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                        {chat.name}
                    </CardTitle>
                </div>
                <Tooltip>
                    <DropdownMenu>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <span className="inline-block w-fit absolute right-4">
                                    <Button size={'icon-sm'} className="text-muted-foreground" onClick={(e) => {   }} variant={'ghost'}>
                                        <MoreVertical/>
                                    </Button>
                                </span>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem><Pencil/> Rename</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive"><Trash/> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <TooltipContent side="bottom" align="end">
                        <p>More options</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <div className="flex-1 min-h-0 flex flex-col">
                <Separator className="mb-2" />
                <Conversation className="relative min-h-0">
                    <ConversationContent>
                        {(status == "ready" && !cacheLoading && messages.length === 0) ? (
                        <ConversationEmptyState
                            description="Messages will appear here as the conversation progresses."
                            icon={<MessageSquareIcon className="size-6" />}
                            title="Start a conversation"
                        />
                        ) : messages.map((message, index) => (
                        <Message from={message.role} key={message.id}>
                            <MessageContent>
                                <MessageParts
                                    message={message}
                                    isLastMessage={index === messages.length - 1}
                                    isStreaming={status =="streaming"}
                                />
                            {/* {message.parts.map((part, i) => {
                                switch (part.type) {
                                    case "reasoning":
                                        return 
                                    case "text":
                                        return (
                                        <MessageResponse key={`${message.id}-${i}`}>
                                            {part.text}
                                        </MessageResponse>
                                        );
                                    default:
                                        return null;
                                }
                            })} */}
                            </MessageContent>
                        </Message>
                        ))}
                        {status == "submitted" ? 
                            <Message from="assistant">
                                <MessageContent className="flex flex-row items-center gap-3">
                                    <Logo type="favicon" className="size-4 invert" />
                                    <Shimmer>
                                        Analysing..
                                    </Shimmer>
                                </MessageContent>
                            </Message>
                        : cacheLoading && <>
                            <Message from={"user"}>
                                <MessageContent>
                                    <MessageResponse>
                                        {previousText}
                                    </MessageResponse>
                                </MessageContent>
                            </Message>
                            <Message from="assistant">
                                <MessageContent className="flex flex-row items-center gap-3">
                                    <Logo type="favicon" className="size-4 invert" />
                                    <Shimmer>
                                        Processing files..    
                                    </Shimmer>
                                </MessageContent>
                            </Message>
                        </>}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
                <PromptInput
                    onSubmit={async(message: PromptInputMessage) => {
                        console.log("Chat id", chat.id);
                        setMessages((x)=> x.filter((m, i)=> !(m.role == "user" && i == x.length - 1)))
                        if (!message.text.trim()) {
                            return;
                        }
                        const oldText = text;
                        setText("");
                        setPreviousText(text);
                        setCacheLoading(true);
                        let newCache;
                        try {
                            if (!noteCtx.cache || !checkCacheMatch(noteCtx.cache.fileIds, noteCtx.files.map(f=>f.id))){
                                console.log("[CHAT] Cache files differ from provided files or no cache. Creating cache...");
                                newCache = await createCache(noteCtx.files.map(f=>f.id), 720)
                            } else {
                                console.log("[CHAT] Cache files match provided files. Extending cache...");
                                newCache = await createOrExtendCache(noteCtx.cache.name, noteCtx.files.map(f=>f.name), 720)
                            }
                            setCacheLoading(false);
                        } catch (err) {
                            console.error("Error creating/extending cache:", err);
                            setCacheLoading(false);
                            setText(oldText);
                            return;
                        }
                        console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
                        setCacheLoading(false);
                        noteCtx.setCache(newCache.name!, noteCtx.files.map(f=>f.id));
                        console.log("Files to upload", message.files)
                        const r = await SendChatMessage({message, files, sendMessage, thinkingLevel, chatId: chat.id, bodyOptions: {cacheName: newCache.name}});
                        if (r === "failed_uploads") {
                            toast.warning("Some files failed to upload.");
                        } else if (r === "error") {
                            toast.error("Error sending message. Please try again.");
                        }
                    }}
                    className="mt-4 px-2"
                >
                    {files.length > 0 && <PromptInputHeader>
                        <ChatInputAttachments files={files} setFiles={setFiles} />
                    </PromptInputHeader>}
                    <PromptInputBody>
                        <PromptInputTextarea
                        disabled={status === "submitted" || cacheLoading}
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                        />
                    </PromptInputBody>
                    <ChatInputFooter files={files} setFiles={setFiles} text={text} thinkingLevel={thinkingLevel} setThinkingLevel={setThinkingLevel} 
                        onStop={()=>{
                            stop();
                            setText(previousText);
                        }}
                        disableSend={status === "submitted" || cacheLoading}
                        disableStop={cacheLoading}
                    />
                </PromptInput>
            </div>
        </Card>
    </>
}