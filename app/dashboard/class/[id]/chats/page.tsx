'use client';
import { PromptInput, PromptInputBody, PromptInputMessage, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import ChatInputFooter from "@/components/chat/ChatInputFooter";
import ChatInputHeader from "@/components/chat/ChatInputHeader";
import { useChatContext } from "@/components/providers/chat-provider";
import { useClass } from "@/components/providers/class-provider";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import createChat from "@/lib/actions/chat/createChat";
import { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import revalidateData from "@/lib/actions/revalidateData";
import { allowedMimeTypes } from "@/lib/utils";
import { Sparkle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewChat(){
    const { _class } = useClass();
    const chatCtx = useChatContext();
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    return <div className="flex flex-col h-full overflow-auto items-center justify-center">
        <Empty className="w-full p-0 h-max flex-0 mb-5">
            <EmptyMedia variant={"icon"} className="size-max p-3">
                <Sparkle className="size-10" strokeWidth={2}/>
            </EmptyMedia>
            <EmptyHeader className="max-w-full">
                <EmptyTitle className="text-2xl font-semibold">How can I help you study today?</EmptyTitle>
                <EmptyDescription>Ask me any questions about <b>{_class.subject}</b> or tackle difficult homework.</EmptyDescription>
            </EmptyHeader>
        </Empty>
        <div className="max-w-lg w-full">
            <PromptInput globalDrop multiple accept={allowedMimeTypes.join(",")} className="mt-4 px-2"
                onSubmit={async(message: PromptInputMessage) => {
                    if (!message.text.trim()) {
                        return;
                    }
                    setCreating(true);
                    try {
                        const response = await createChat(_class.id)
                        await revalidateData(`/dashboard/class/${_class.id}/chats`);
                        router.push(`/dashboard/class/${_class.id}/chats/${response[0].id}?fromNewChat=true`);
                    } catch (error) {
                        console.error("Error creating chat:", error);
                        toast.error("Failed to create chat. Please try again.");
                    } finally {
                        setCreating(false);
                    }
                }}
            >
                {chatCtx.newFiles.length > 0 && <ChatInputHeader files={chatCtx.newFiles} setFiles={chatCtx.setNewFiles} />}
                <PromptInputBody>
                    <PromptInputTextarea onChange={(e) => chatCtx.setNewText(e.target.value)} value={chatCtx.newText}/>
                </PromptInputBody>
                <ChatInputFooter files={chatCtx.newFiles} setFiles={chatCtx.setNewFiles} text={chatCtx.newText} thinkingLevel={chatCtx.newThinkingLevel} setThinkingLevel={chatCtx.setNewThinkingLevel} 
                    onStop={()=>{
                        stop();
                    }}
                    disableSend={creating}
                    disableStop={creating}
                />
            </PromptInput>
        </div>
    </div>
}