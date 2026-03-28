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
import { Button } from "@/components/ui/button";
import saveToChat from "@/lib/actions/chat/saveToChat";
import SendChatMessage, { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import { chats, ChatSelect } from "@/lib/schemas/schema";
import { allowedMimeTypes } from "@/lib/utils";
import { chatModels, ChatUIMessage } from "@/lib/utils/models";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowRight, Cross, MessageSquareIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react";
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
    const [chatModelIndex, setChatModelIndex] = useState(0);
    const promptInputRef = useRef<HTMLTextAreaElement>(null);

    const { messages, sendMessage, setMessages, status, error, stop, clearError, regenerate } = useChat<ChatUIMessage>({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
        onFinish: async ({messages, finishReason, isAbort, isDisconnect, isError})=>{
            console.log("Chat finished with reason:", finishReason);
            if (finishReason === undefined && !isAbort && !isDisconnect && !isError){
                if (chatModelIndex < chatModels.length - 1){
                    console.log("Attempting to regenerate with fallback model:", chatModels[chatModelIndex + 1].name);
                    // await SendChatMessage({message: {text: chatCtx.newText, files: chatCtx.newFiles}, files: chatCtx.newFiles, sendMessage, thinkingLevel: chatCtx.newThinkingLevel, chatId: chat.id, bodyOptions: {chatModelIndex: chatModelIndex + 1}});
                    setTimeout(()=>{
                        console.log("Regenerating with fallback model:", chatModels[chatModelIndex + 1].name);
                        regenerate({body: {chatModelIndex: chatModelIndex + 1}});
                    }, 0)
                    setChatModelIndex(chatModelIndex + 1)
                } else {
                    setChatModelIndex(0);
                    console.log("No more fallback models available.");
                    toast.error("Chat failed to generate a response. Please try again.");
                }
            } else {
                console.log("Chat finished successfully:", finishReason);
                setChatModelIndex(0);
            }
            setMessages(messages);
            await saveToChat(chat.id, { messages });
            console.log("isAbort:", isAbort, "isDisconnect:", isDisconnect, "isError:", isError);
        },
        messages: chat.messages,
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
                    const r = await SendChatMessage({message: {text: chatCtx.newText, files: chatCtx.newFiles}, files: chatCtx.newFiles, sendMessage, thinkingLevel: chatCtx.newThinkingLevel, chatId: chat.id, bodyOptions: {chatModelIndex}});
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
        if (promptInputRef.current) {
            promptInputRef.current.focus();
        }
        return ()=>{
            stop();
        }
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
                            {`Analysing.. ${chatModelIndex == 1 ? "(Attempt 2)" : chatModelIndex == 2 ? "(Attempt 3)" : ""}`}
                        </Shimmer>
                    </MessageContent>
                </Message>}
            </ConversationContent>
            <ConversationScrollButton />
        </Conversation>
        {error && <div className="flex w-full max-w-xl items-center justify-between mt-4 mb-0 bg-card border rounded-md p-4">
            <div>
                <h2 className="font-medium">An error occurred!</h2>
                <p className="text-sm text-muted-foreground">Something went wrong when generating the response. Please try again.</p>
            </div>
            <Button variant={"outline"} onClick={() => clearError()}>
                Dismiss
            </Button>
        </div>}
        {chat.notebookId ? 
        <div className="flex w-full max-w-xl items-center justify-between mt-4 mb-3 bg-card border rounded-md p-4">
            <div>
                <h2 className="font-medium">This is a notebook chat</h2>
                <p className="text-sm text-muted-foreground">To send messages, please go to the notebook view.</p>
            </div>
            <Button variant={"outline"} onClick={()=> router.push(`/dashboard/class/${chat.classId}/notebooks/${chat.notebookId}`)}>Go to notebook <ArrowRight/></Button>
        </div>
        : <PromptInput autoFocus globalDrop multiple accept={allowedMimeTypes.join(",")} className="mt-4 px-2 max-w-xl w-full shrink-0"
            onSubmit={async(message: PromptInputMessage) => {
                if (!message.text.trim() || status == "submitted" || status == "streaming") {
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
                <PromptInputTextarea ref={promptInputRef} autoFocus onChange={(e) => setText(e.target.value)} value={text}/>
            </PromptInputBody>
            <ChatInputFooter files={files} setFiles={setFiles} text={text} thinkingLevel={thinkingLevel} setThinkingLevel={setThinkingLevel} 
                onStop={()=>{
                    stop();
                    setText(previousText);
                    setFiles(previousFiles);
                }}
                disableSend={status == "submitted" || status == "streaming"}
                disableStop={false}
            />
        </PromptInput>}
    </div>
}