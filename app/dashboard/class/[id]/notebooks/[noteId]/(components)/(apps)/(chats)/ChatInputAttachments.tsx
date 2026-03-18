import { Attachments, Attachment, AttachmentPreview, AttachmentRemove, AttachmentHoverCard, AttachmentHoverCardTrigger, AttachmentHoverCardContent, getAttachmentLabel } from "@/components/ai-elements/attachments";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input"
import { FileUIPart } from "ai";

export default function ChatInputAttachments({files, setFiles}:{files: (FileUIPart & {id: string})[], setFiles: (files: any) => void}){
    const { files:promptFiles, remove: removePromptFile } = usePromptInputAttachments();
    return <div className="flex items-center justify-center">
        <Attachments variant="grid">
            {files.map((attachment) => (
                <AttachmentHoverCard key={attachment.id}>
                    <AttachmentHoverCardTrigger asChild>
                        <Attachment
                            key={attachment.id}
                            data={attachment}
                            onRemove={() => {
                                if (promptFiles.some((f) => f.id === attachment.id)){
                                    removePromptFile(attachment.id);
                                }
                                setFiles(files.filter((f) => f.id !== attachment.id))
                            }}
                        >
                            <AttachmentPreview />
                            <AttachmentRemove />
                        </Attachment>
                    </AttachmentHoverCardTrigger>
                    <AttachmentHoverCardContent>
                        <div className="space-y-3">
                            <div className="space-y-1 px-0.5">
                                <h4 className="font-semibold text-sm leading-none">{getAttachmentLabel(attachment)}</h4>
                                {attachment.mediaType && (
                                <p className="font-mono text-muted-foreground text-xs">
                                    {attachment.mediaType}
                                </p>
                                )}
                            </div>
                        </div>
                    </AttachmentHoverCardContent>
                </AttachmentHoverCard>
            ))}
        </Attachments>
    </div>
}