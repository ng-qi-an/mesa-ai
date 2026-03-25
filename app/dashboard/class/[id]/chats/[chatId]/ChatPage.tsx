'use client';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputMessage, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import ChatInputFooter from "@/components/chat/ChatInputFooter";
import ChatInputHeader from "@/components/chat/ChatInputHeader";
import ChatMessageContent from "@/components/chat/ChatMessageContent";
import Logo from "@/components/logo";
import { useChatContext } from "@/components/providers/chat-provider";
import saveToChat from "@/lib/actions/chat/saveToChat";
import SendChatMessage, { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import { ChatSelect } from "@/lib/schemas/schema";
import { allowedMimeTypes } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquareIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ChatPage({chat}:{chat: ChatSelect}){
    const search = useSearchParams();
    const chatCtx = useChatContext();
    const router = useRouter();

    const [text, setText] = useState("");
    const [previousText, setPreviousText] = useState("");
    const [files, setFiles] = useState<ChatAttachmentType[]>([]);
    const [previousFiles, setPreviousFiles] = useState<ChatAttachmentType[]>([]);
    const [thinkingLevel, setThinkingLevel] = useState("minimal");

    const { messages, sendMessage, setMessages, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
        messages: chat.messages,
        onFinish: async ({messages}) => {
            setMessages(messages);
            await saveToChat(chat.id, { messages });
        }
    }); 

    useEffect(()=>{
        (async()=>{
            console.log("ChatPage rerendered, isFromNewChat:", search.get("fromNewChat"));
            const isFromNewChat = search.has("fromNewChat")
            if (isFromNewChat) {
                if (chat.messages.length == 0){
                    const oldText = text;
                    const oldFiles = files;
                    setPreviousText(text);
                    chatCtx.setNewText("");
                    setPreviousFiles(files);
                    chatCtx.setNewFiles([]);
                    setThinkingLevel(chatCtx.newThinkingLevel);
                    chatCtx.setNewThinkingLevel("minimal");
                    const r = await SendChatMessage({message: {text: chatCtx.newText, files: chatCtx.newFiles}, files: chatCtx.newFiles, sendMessage, thinkingLevel: chatCtx.newThinkingLevel, chatId: chat.id});
                    console.log("SendChatMessage result:", r);
                    if (r === "failed_uploads") {
                        toast.warning("Some files failed to upload.");
                    } else if (r === "error") {
                        setText(oldText);
                        setFiles(oldFiles);
                        toast.error("Error sending message. Please try again.");
                    }
                    router.replace(window.location.pathname);
                }
            }
        })();
    }, [])
    return <div className="flex flex-col h-full flex-1 min-h-0 w-full items-center py-4">
        <Conversation className="relative min-h-0 w-full max-w-2xl">
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
                {status == "submitted" && <Message from="assistant">
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
        <PromptInput autoFocus globalDrop multiple accept={allowedMimeTypes.join(",")} className="mt-4 px-2 max-w-xl w-full shrink-0"
            onSubmit={async(message: PromptInputMessage) => {
                if (!message.text.trim()) {
                    return;
                }
                setMessages((x)=> x.filter((m, i)=> !(m.role == "user" && i == x.length - 1)))
                const oldText = text;
                const oldFiles = files;
                setPreviousText(text);
                setPreviousFiles(files);
                setText("");
                setFiles([]);
                const r = await SendChatMessage({message: message, files: files, sendMessage, thinkingLevel: thinkingLevel, chatId: chat.id});
                console.log("SendChatMessage result:", r);
                if (r === "failed_uploads") {
                    toast.warning("Some files failed to upload.");
                } else if (r === "error") {
                    setText(oldText);
                    setFiles(oldFiles);
                    toast.error("Error sending message. Please try again.");
                }
            }}
        >
            {files.length > 0 && <ChatInputHeader files={files} setFiles={setFiles} />}
            <PromptInputBody>
                <PromptInputTextarea autoFocus onChange={(e) => setText(e.target.value)} value={text}/>
            </PromptInputBody>
            <ChatInputFooter files={files} setFiles={setFiles} text={text} thinkingLevel={thinkingLevel} setThinkingLevel={setThinkingLevel} 
                onStop={()=>{
                    stop();
                    setText(previousText);
                    setFiles(previousFiles);
                }}
                disableSend={status == "submitted"}
                disableStop={false}
            />
        </PromptInput>
    </div>
}