'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NotebookContext } from "@/lib/contexts";
import { ChevronDown, ChevronLeft, ListTodo, MessageSquare, MessageSquarePlus, Mic, MoreVertical, Plus, WalletCards } from "lucide-react";
import { cacheSignal, useContext, useState } from "react";
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
import { DefaultChatTransport } from "ai";
import { text } from "stream/consumers";
import createOrExtendCache from "@/lib/cache-actions/createOrExtendCache";
import createCache from "@/lib/cache-actions/createCache";

export default function ChatMessagesPanel({selectedChat, setSelectedChat}: {selectedChat: string, setSelectedChat: (chat: string) => void}){
    const noteCtx = useContext(NotebookContext);
    const [text, setText] = useState<string>("");
    const [thinkingLevel, setThinkingLevel] = useState("minimal");
    const { messages, sendMessage, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/notebook/chat',
        }),
    }); 
    const [cacheLoading, setCacheLoading] = useState(false);
    return noteCtx && <Card size="sm" className={`rounded-md ring-neutral-900 h-full`}>
            <CardHeader className="items-center group flex cursor-pointer relative">
                <div className="flex w-full items-center gap-1" onClick={()=> setSelectedChat("")}>
                    <ChevronLeft onClick={()=> setSelectedChat("")} className="text-muted-foreground group-hover:text-foreground size-4"/>
                    <CardTitle 
                    className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                        {selectedChat == "create" ? "New chat" : selectedChat}
                    </CardTitle>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-block w-fit absolute right-4">
                            <Button size={'icon-sm'} className="text-muted-foreground" onClick={(e) => {   }} variant={'ghost'}>
                                <MoreVertical/>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                        <p>More options</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <div className="h-full flex flex-col">
                <Separator className="mb-2" />
                <Conversation className="relative size-full">
                    <ConversationContent>
                        {messages.length === 0 ? (
                        <ConversationEmptyState
                            description="Messages will appear here as the conversation progresses."
                            icon={<MessageSquareIcon className="size-6" />}
                            title="Start a conversation"
                        />
                        ) : messages.map((message) => (
                        <Message from={message.role} key={message.id}>
                            <MessageContent>
                            {message.parts.map((part, i) => {
                                switch (part.type) {
                                case "text":
                                    return (
                                    <MessageResponse key={`${message.id}-${i}`}>
                                        {part.text}
                                    </MessageResponse>
                                    );
                                default:
                                    return null;
                                }
                            })}
                            </MessageContent>
                        </Message>
                        ))}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
                <PromptInput
                    onSubmit={async(message: PromptInputMessage) => {
                        const hasText = Boolean(message.text);

                        if (!(hasText)) {
                            return;
                        }

                        setCacheLoading(true);
                        let newCache;
                        try {
                            if (!noteCtx.cache || !noteCtx.checkCacheMatch(noteCtx.cache.files, noteCtx.files)){
                                console.log("[CHAT] Cache files differ from provided files or no cache. Creating cache...");
                                newCache = await createCache(noteCtx.files.map(f=>f.name), 720)
                            } else {
                                console.log("[CHAT] Cache files match provided files. Extending cache...");
                                newCache = await createOrExtendCache(noteCtx.cache.name, noteCtx.files.map(f=>f.name), 720)
                            }
                            setCacheLoading(false);
                        } catch (err) {
                            console.error("Error creating/extending cache:", err);
                            setCacheLoading(false);
                            return;
                        }
                        console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
                        setCacheLoading(false);
                        noteCtx.setCache(newCache.name!, noteCtx.files);
                        sendMessage({text: message.text}, {
                            body: {
                                thinkingLevel,
                                cacheName: newCache.name!
                            }
                        }
                        );
                        setText("");
                    }}
                    className="mt-4 px-2"
                >
                    <PromptInputBody>
                        <PromptInputTextarea
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                        />
                    </PromptInputBody>
                    <PromptInputFooter>
                        <PromptInputTools>
                        <PromptInputSelect
                            onValueChange={setThinkingLevel}
                            value={thinkingLevel}
                        >
                            <PromptInputSelectTrigger>
                            <PromptInputSelectValue />
                            </PromptInputSelectTrigger>
                            <PromptInputSelectContent>
                                <PromptInputSelectItem value={"minimal"}>
                                    Fast
                                </PromptInputSelectItem>
                                <PromptInputSelectItem value={"low"}>
                                    Thinking
                                </PromptInputSelectItem>
                                <PromptInputSelectItem value={"medium"}>
                                    Deep thinking
                                </PromptInputSelectItem>
                            </PromptInputSelectContent>
                        </PromptInputSelect>
                        </PromptInputTools>
                        <PromptInputSubmit  disabled={!text && !status} status={cacheLoading ? "submitted" : status} />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </Card>
}