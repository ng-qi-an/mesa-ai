import { PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger, PromptInputFooter, PromptInputSelect, PromptInputSelectContent, PromptInputSelectItem, PromptInputSelectTrigger, PromptInputSelectValue, PromptInputSubmit, PromptInputTools, usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
import FileSelectorDialog from "@/components/file-browser/dialogs/FileSelectorDialog";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Brain, BrainCircuit, Rabbit, Scale, Square, Zap } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ChatAttachmentType } from "../../lib/actions/chat/sendChatMessage";
import ModelSwitcher from "./ModelSwitcher";
import { ThinkingLevels } from "@/lib/utils/models";

export default function ChatInputFooter({thinkingLevel, setThinkingLevel, selectedModel, setSelectedModel, text, files, setFiles, onStop, disableStop, disableSend}:{thinkingLevel: ThinkingLevels, setThinkingLevel: (level: ThinkingLevels) => void, selectedModel: string, setSelectedModel: (model: string) => void, text: string, files: ChatAttachmentType[], setFiles: Dispatch<SetStateAction<ChatAttachmentType[]>>, onStop: () => void, disableStop: boolean, disableSend: boolean}){
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
            <ModelSwitcher selectedModel={selectedModel} setSelectedModel={setSelectedModel}/>
            <PromptInputSelect
                onValueChange={setThinkingLevel}
                value={thinkingLevel}
            >
                <PromptInputSelectTrigger className="bg-transparent dark:bg-transparent group">
                <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                    <PromptInputSelectItem value={"minimal"}>
                        <Zap />
                        <div className="flex flex-col">
                            <p>Very fast</p>
                            <p className="group-data-[slot=select-trigger]:hidden text-xs text-muted-foreground">
                                Quickest responses, but limited reasoning.
                            </p>
                        </div>
                    </PromptInputSelectItem>
                    <PromptInputSelectItem value={"low"}>
                        <Rabbit/>
                        <div className="flex flex-col">
                            <p>Fast</p>
                            <p className="group-data-[slot=select-trigger]:hidden text-xs text-muted-foreground">
                                Quick responses, some reasoning.
                            </p>
                        </div>
                    </PromptInputSelectItem>
                    <PromptInputSelectItem value={"medium"}>
                        <Scale/>
                        <div className="flex flex-col">
                            <p>Balanced</p>
                            <p className="group-data-[slot=select-trigger]:hidden text-xs text-muted-foreground">
                                Average reasoning and response time.
                            </p>
                        </div>
                    </PromptInputSelectItem>
                    <PromptInputSelectItem value={"high"}>
                        <Brain/>
                        <div className="flex flex-col">
                            <p>Smarter</p>
                            <p className="group-data-[slot=select-trigger]:hidden text-xs text-muted-foreground">
                                Better reasoning, slower responses.
                            </p>
                        </div>
                    </PromptInputSelectItem>
                    <PromptInputSelectItem value={"xhigh"}>
                        <BrainCircuit/>
                        <div className="flex flex-col">
                            <p>Extreme</p>
                            <p className="group-data-[slot=select-trigger]:hidden text-xs text-muted-foreground">
                                Most thorough reasoning, longest response time.
                            </p>
                        </div>
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