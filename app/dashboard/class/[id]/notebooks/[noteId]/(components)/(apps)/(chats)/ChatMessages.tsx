'use client';
import { AlertCircleIcon, ChartNoAxesColumn, X } from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import Logo from "@/components/logo";
import {
  Conversation,
  ConversationContent,
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
import { Chat } from "@ai-sdk/react";
import { FileUIPart, UIMessage } from "ai";
import { useNotebook } from "@/components/providers/notebook-provider";
import { Shimmer } from "@/components/ai-elements/shimmer";
import ChatInputFooter from "@/components/chat/ChatInputFooter";
import SendChatMessage, { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import { toast } from "sonner";
import { ChatSelect } from "@/lib/schemas/schema";
import ChatInputHeader from "@/components/chat/ChatInputHeader";
import ChatMessageContent from "@/components/chat/ChatMessageContent";
import { allowedFileTypesList, allowedMimeTypes } from "@/lib/utils";
import { useClass } from "@/components/providers/class-provider";
import { ChatUIMessage, freeChatModels, getLowerUsageWarningBoundary, ThinkingLevels, usagePercentageWarnings } from "@/lib/utils/models";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import createChat from "@/lib/actions/chat/createChat";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useUsage } from "@/components/providers/usage-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AIExtension, AIRequest } from "@blocknote/xl-ai";
import { ShowSelectionExtension } from "@blocknote/core/extensions";
import { useExtension } from "@blocknote/react";
import saveNotebookBlocks from "@/lib/actions/notebook/saveNotebookBlocks";
import { buildNotebookAIRequest } from "./buildNotebookAIRequest";
import { sendNotebookMessage } from "./sendNotebookMessage";
import { clearNotebookAICursor } from "./notebookAICursor";
import generateChatName from "@/lib/actions/chat/generateChatName";
import uploadChatFiles from "@/lib/actions/chat/uploadChatFiles";

export default function ChatMessages({messages, setMessages, sendMessage, error, clearError, status, notebookChat, insufficientWarning, setInsufficientWarning, loadingChat, chat, setChat, loadingChatName, setLoadingChatName, chatName, setChatName, selectedModel, setSelectedModel}: {messages: ChatUIMessage[], setMessages: React.Dispatch<React.SetStateAction<ChatUIMessage[]>>, sendMessage: any, error: Error | undefined, clearError: () => void, status: "ready" | "submitted" | "streaming" | "error", notebookChat: Chat<UIMessage<any, any, any>>, insufficientWarning: boolean, setInsufficientWarning: (value: boolean) => void, loadingChat: boolean, chat: ChatSelect | null, setChat: any, loadingChatName: boolean, setLoadingChatName: (loading: boolean) => void, chatName: string, setChatName: (name: string) => void, selectedModel: string, setSelectedModel: (model: string) => void}){
    const [hasPendingAIChanges, setHasPendingAIChanges] = useState(false);
    const {_class} = useClass();
    const noteCtx = useNotebook();
    const aiExtension = useExtension(AIExtension, {
        editor: noteCtx.editor,
    });
    const [text, setText] = useState<string>("");
    const [files, setFiles] = useState<ChatAttachmentType[]>([]);
    const [previousFiles, setPreviousFiles] = useState<ChatAttachmentType[]>([]);
    const [previousText, setPreviousText] = useState<string>("");
    const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevels>("low");
    const { creditUsagePercentage } = useUsage();
    const [activeAIRequest, setActiveAIRequest] = useState<AIRequest | null>(null);
    const notebookEditedRef = useRef(false);
    const beforeNotebookEditRef = useRef<any[] | null>(null);
    const wasStoppedRef = useRef(false);
    
    useEffect(() => {
        const aiExtension = noteCtx.editor.getExtension(AIExtension);

        if (!aiExtension) {
            throw new Error("BlockNote AI extension is not registered.");
        }

        aiExtension.options.setState({
            chatProvider: () => notebookChat as unknown as Chat<UIMessage>,
        });
    }, [noteCtx.editor, notebookChat]);
    
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
                    setInsufficientWarning(true);
                }
            } else {
                setInsufficientWarning(true);
            }
        }
    }, [creditUsagePercentage])
    function recoverNotebookDocument(editor: any, beforeNotebookEditRef: RefObject<any[] | null>) {
        const aiExtension = editor.getExtension(AIExtension);
        try {
            aiExtension?.rejectChanges();
        } catch (rejectError) {
            console.error("BlockNote rejectChanges failed; restoring pre-edit document:", rejectError);

            const oldBlocks = beforeNotebookEditRef.current;

            if (oldBlocks) {
                try {
                    editor.replaceBlocks(editor.document, oldBlocks);
                } catch (restoreError) {
                    console.error("Failed to restore the pre-edit document:", restoreError);
                }
            }
        } finally {
            try {
            aiExtension?.closeAIMenu();
            } catch (closeError) {
            console.error("Failed to close BlockNote AI session:", closeError);

            // Never leave the user locked out of the editor.
            editor.isEditable = true;
            editor.focus();
            }

            beforeNotebookEditRef.current = null;
        }
    }
    return <div className="flex-1 min-h-0 flex flex-col px-1">
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
                {insufficientWarning && <div className="w-full h-full rounded-lg bg-neutral-900 border flex items-center px-3 py-2 gap-2">
                    <ChartNoAxesColumn className="size-4 shrink-0 text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">You've used <span className="text-foreground/80 font-medium">{creditUsagePercentage >= 1 ? "100%" : Math.floor(creditUsagePercentage * 100) + "%"}</span> of your credits. {creditUsagePercentage >= 1 ? "Use free models or upgrade your plan." : creditUsagePercentage >= 0.9 ? "Consider using cheaper models." : creditUsagePercentage >= 0.75 ? "Consider using cheaper models." : creditUsagePercentage >= 0.5 && "Consider using less reasoning."}</p>
                    <X className="size-4 shrink-0 text-muted-foreground hover:text-foreground ml-auto cursor-pointer" onClick={()=> {
                        setInsufficientWarning(false)
                        const lowerUsageWarningBoundary = getLowerUsageWarningBoundary(creditUsagePercentage);
                        window.localStorage.setItem("dismissedUsagePercentage", lowerUsageWarningBoundary.toString())
                    }}/>
                </div>}
                {hasPendingAIChanges && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                        <p className="mr-auto text-sm text-muted-foreground">
                        Review the proposed notebook changes.
                        </p>

                        <Button
                        size="sm"
                        variant="outline"
                        onClick={()=>{
                            try {
                                aiExtension.rejectChanges();
                                toast("Notebook changes rejected.");
                            } catch (error) {
                                console.error("Failed to reject notebook AI changes:", error);
                                toast.error("Failed to reject notebook AI changes.");
                                recoverNotebookDocument(noteCtx.editor, beforeNotebookEditRef);
                            }
                            setHasPendingAIChanges(false);
                            clearNotebookAICursor(noteCtx.editor);
                            notebookEditedRef.current = false;
                        }}
                        >
                        Reject
                        </Button>

                        <Button
                        size="sm"
                        variant="raised"
                        onClick={async()=>{
                            try {
                                aiExtension.acceptChanges();
                                const newBlocks = await saveNotebookBlocks(noteCtx.noteId, {
                                blocks: noteCtx.editor.document,
                                });
                                noteCtx.setBlocks(newBlocks.blocks);
                            } catch (error) {
                                recoverNotebookDocument(noteCtx.editor, beforeNotebookEditRef);
                                console.error("Failed to apply notebook AI changes:", error);
                                toast.error("An error occured when applying changes. Try changing your prompt, or select something else.");
                            }
                            setHasPendingAIChanges(false);
                            clearNotebookAICursor(noteCtx.editor);
                            notebookEditedRef.current = false;
                        }}
                        >
                        Apply changes
                        </Button>
                    </div>
                )}
            </div>
            <PromptInput
                globalDrop
                multiple
                accept={allowedFileTypesList.join(",")}
                onSubmit={async(message: PromptInputMessage) => {
                    if (!message.text.trim() || status == "submitted" || status == "streaming" || hasPendingAIChanges) {
                        return;
                    }
                    wasStoppedRef.current = false;
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
                    let chatFiles: (FileUIPart & { id: string })[];
                    try {
                        chatFiles = await uploadChatFiles({message, files, chatId});
                    } catch (error) {
                        toast.warning("Some files failed to upload.");
                        return;
                    }
                    try {
                        await sendNotebookMessage({message, files: chatFiles, editor: noteCtx.editor, notebookChat, activeAIRequest, setActiveAIRequest, setHasPendingAIChanges, notebookEditedRef, beforeNotebookEditRef, chatId, _class, thinkingLevel, noteId: noteCtx.noteId, selectedModel});
                        if (wasStoppedRef.current) {
                            throw new Error("Request stopped by user.");
                        }
                        console.log("Current messages length", messages.length);
                        if (messages.length == 0){
                            (async()=>{
                                setLoadingChatName(true);
                                const name = await generateChatName({chatId, message: message.text});
                                if (name) {
                                    setChatName(name);
                                    setChat((c: ChatSelect) => c ? {...c, name} : c);
                                }
                                setLoadingChatName(false);
                            })();
                        }
                    } catch (error) {
                        console.error("Failed to send notebook message with tools:", error);
                        setText(oldText);
                        setFiles(oldFiles);
                        if (wasStoppedRef.current) {
                            toast("AI response stopped.");
                        } else {
                            toast.error("Error sending message. Please try again.");
                        }
                        if (notebookEditedRef.current) {
                            clearNotebookAICursor(noteCtx.editor);
                            recoverNotebookDocument(noteCtx.editor, beforeNotebookEditRef);
                        }
                        throw error;
                    }
                }}
            >
                {files.length > 0 && <ChatInputHeader files={files} setFiles={setFiles} />}
                <PromptInputBody>
                    <PromptInputTextarea
                    placeholder="What would you like to do today?"
                    onChange={(e) => setText(e.target.value)}
                    onMouseDownCapture={async () => {
                        if (!noteCtx.editor.getSelection()) {
                            setActiveAIRequest(null);
                            return;
                        }
                        setActiveAIRequest(await buildNotebookAIRequest(noteCtx.editor, notebookEditedRef, beforeNotebookEditRef));
                        noteCtx.editor.getExtension(ShowSelectionExtension)?.showSelection(true, "notebook-chat");
                    }}
                    onBlurCapture={()=>{
                        noteCtx.editor.getExtension(ShowSelectionExtension)?.showSelection(false, "notebook-chat");
                    }}
                    value={text}
                    />
                </PromptInputBody>
                <ChatInputFooter selectedModel={selectedModel} setSelectedModel={setSelectedModel} files={files} setFiles={setFiles} text={text} thinkingLevel={thinkingLevel} setThinkingLevel={setThinkingLevel} 
                    onStop={()=>{
                        stop();
                        setText(previousText);
                        setFiles(previousFiles);
                        wasStoppedRef.current = true;
                    }}
                    disableSend={status === "submitted" || status == "streaming" || hasPendingAIChanges || notebookEditedRef.current == true}
                    disableStop={false}
                />
            </PromptInput>
        </div>
    </div>
}