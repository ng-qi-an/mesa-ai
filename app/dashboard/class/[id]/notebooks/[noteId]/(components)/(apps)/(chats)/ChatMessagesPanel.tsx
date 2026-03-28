'use client';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
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

import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { MessageSquareIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import createOrExtendCache from "@/lib/cache-actions/createOrExtendCache";
import createCache from "@/lib/cache-actions/createCache";
import { useNotebook } from "@/components/providers/notebook-provider";
import checkCacheMatch from "../../../(actions)/checkCacheMatch";
import { Shimmer } from "@/components/ai-elements/shimmer";
import ChatInputFooter from "@/components/chat/ChatInputFooter";
import SendChatMessage, { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import { toast } from "sonner";
import { ChatSelect } from "@/lib/schemas/schema";
import SaveToNotebook from "../../../(actions)/saveToNotebook";
import saveToChat from "@/lib/actions/chat/saveToChat";
import ChatInputHeader from "@/components/chat/ChatInputHeader";
import ChatMessageContent from "@/components/chat/ChatMessageContent";
import ChatActionsDropdown from "./ChatActionsDropdown";
import { allowedMimeTypes } from "@/lib/utils";

export default function ChatMessagesPanel({setSelectedChatId, initialChat}: {setSelectedChatId: (chat: string) => void, initialChat: ChatSelect}){
    const noteCtx = useNotebook();
    const [text, setText] = useState<string>("");
    const [chat, setChat] = useState<ChatSelect>(initialChat);
    const [files, setFiles] = useState<ChatAttachmentType[]>([]);
    const [previousFiles, setPreviousFiles] = useState<ChatAttachmentType[]>([]);
    const [previousText, setPreviousText] = useState<string>("");
    const [thinkingLevel, setThinkingLevel] = useState("minimal");
    const { messages, sendMessage, setMessages, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/notebook/chat',
        }),
        messages: chat.messages,
        onFinish: async ({messages}) => {
            setMessages(messages);
            await saveToChat(chat.id, { messages });
        }
    }); 
    useEffect(()=>{
        console.log("ChatMessagesPanel mounted with chat:", initialChat);
    }, [])

    return <>
        <Card size="sm" className={`rounded-md ring-neutral-200 dark:ring-neutral-900 h-full pb-2!`}>
            <CardHeader className="items-center group flex cursor-pointer relative">
                <div className="flex w-full items-center gap-1" onClick={()=> setSelectedChatId("")}>
                    <ChevronLeft onClick={()=> setSelectedChatId("")} className="text-muted-foreground group-hover:text-foreground size-4"/>
                    <CardTitle 
                    className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                        {chat.name}
                    </CardTitle>
                </div>
                <ChatActionsDropdown triggerClassName="inline-block w-fit absolute -top-1 right-4" chat={chat} onRename={(newName) => {
                    setChat({...chat, name: newName});
                }} onDelete={()=>{
                    setSelectedChatId("");
                }}/>
            </CardHeader>
            <div className="flex-1 min-h-0 flex flex-col">
                <Separator className="mb-2" />
                <Conversation className="relative min-h-0">
                    <ConversationContent>
                        {(status == "ready" && messages.length === 0) ? (
                        <ConversationEmptyState
                            description="Messages will appear here as the conversation progresses."
                            icon={<MessageSquareIcon className="size-6" />}
                            title="Start a conversation"
                        />
                        ) : messages.map((message, index) => (
                        <Message from={message.role} key={message.id}>
                            <ChatMessageContent
                                message={message}
                                isLastMessage={index === messages.length - 1}
                                isStreaming={status =="streaming"}
                            />
                        </Message>
                        ))}
                        {status == "submitted" &&
                            <Message from="assistant">
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
                <PromptInput
                    globalDrop
                    multiple
                    accept={allowedMimeTypes.join(",")}
                    onSubmit={async(message: PromptInputMessage) => {
                        if (!message.text.trim() || status == "submitted" || status == "streaming"){
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

                        const r = await SendChatMessage({message, files, sendMessage, thinkingLevel, chatId: chat.id, bodyOptions: {fileStoreId: noteCtx.fileStoreId}});
                        console.log("SendChatMessage result:", r);
                        if (r === "failed_uploads") {
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
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                        />
                    </PromptInputBody>
                    <ChatInputFooter files={files} setFiles={setFiles} text={text} thinkingLevel={thinkingLevel} setThinkingLevel={setThinkingLevel} 
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
        </Card>
    </>
}