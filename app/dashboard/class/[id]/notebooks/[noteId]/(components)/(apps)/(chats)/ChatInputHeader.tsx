import { PromptInputHeader, usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
import ChatAttachments from "./ChatAttachments";
import { ChatAttachmentType } from "./sendChatMessage";

export default function ChatInputHeader({files, setFiles}: {files: ChatAttachmentType[], setFiles: (x: ChatAttachmentType[]) => void}){
    const { files:promptFiles, remove: removePromptFile } = usePromptInputAttachments();
    return <PromptInputHeader>
        <ChatAttachments files={files} onRemove={(x: string)=>{
            if (promptFiles.some((f) => f.id === x)){
                removePromptFile(x);
            }
            setFiles(files.filter((f) => f.id !== x))
        }} />
    </PromptInputHeader>
}