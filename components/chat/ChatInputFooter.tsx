import { PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger, PromptInputFooter, PromptInputSelect, PromptInputSelectContent, PromptInputSelectItem, PromptInputSelectTrigger, PromptInputSelectValue, PromptInputSubmit, PromptInputTools, usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
import FileSelectorDialog from "@/components/file-browser/dialogs/FileSelectorDialog";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Square } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ChatAttachmentType } from "../../lib/actions/chat/sendChatMessage";

export default function ChatInputFooter({thinkingLevel, setThinkingLevel, text, files, setFiles, onStop, disableStop, disableSend}:{thinkingLevel: string, setThinkingLevel: (level: string) => void, text: string, files: ChatAttachmentType[], setFiles: Dispatch<SetStateAction<ChatAttachmentType[]>>, onStop: () => void, disableStop: boolean, disableSend: boolean}){
    const [showMesaDrive, setShowMesaDrive] = useState(false);
    const { files:promptFiles } = usePromptInputAttachments();
    useEffect(()=>{
        setFiles((x: ChatAttachmentType[]) => {
            const promptIds = promptFiles.map((file) => file.id);
            const nonPromptFiles = x.filter((file) => !promptIds.includes(file.id));
            return [...nonPromptFiles, ...promptFiles.map((file) => ({...file, drive: false}))];
        });
    }, [promptFiles])
    return <PromptInputFooter>
        <FileSelectorDialog open={showMesaDrive} setOpen={setShowMesaDrive} onConfirm={(selected)=> {
            console.log(selected)
            setFiles((x: ChatAttachmentType[]) => {
                const existingIds = x.map((file) => file.id);
                const finalFiles = selected
                    .filter((file) => !existingIds.includes(file.id))
                    .map((file) => ({ id: file.id, filename: file.name, type: "file" as const, url: "", mediaType: file.contentType, drive: true}));
                console.log("Adding files to prompt attachments:", finalFiles);
                return [...x, ...finalFiles];
            });
            setShowMesaDrive(false);
        }}/>
        <PromptInputTools>
            <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent className="w-max">
                    <PromptInputActionAddAttachments />
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={()=> setShowMesaDrive(true)}><Logo className="size-4 mr-1.5"/> Mesa Drive</DropdownMenuItem>
                </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputSelect
                onValueChange={setThinkingLevel}
                value={thinkingLevel}
            >
                <PromptInputSelectTrigger className="bg-transparent dark:bg-transparent">
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
        {(disableSend || disableStop) ?
            <Button onClick={onStop} disabled={disableStop} variant={"secondary"} size={"icon-sm"}>
                {disableStop ? <Spinner/> : <Square />}
            </Button>
        :
            <PromptInputSubmit disabled={!text.trim() || disableSend} status={disableSend ? "submitted" : "ready"} />
        }
    </PromptInputFooter>
}