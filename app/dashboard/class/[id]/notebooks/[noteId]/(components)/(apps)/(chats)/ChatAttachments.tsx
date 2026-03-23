import { Attachments, Attachment, AttachmentPreview, AttachmentRemove, AttachmentHoverCard, AttachmentHoverCardTrigger, AttachmentHoverCardContent, getAttachmentLabel } from "@/components/ai-elements/attachments";
import { ChatAttachmentType } from "./sendChatMessage";
import { FileUIPart } from "ai";

export default function ChatAttachments({files, onRemove}:{files: ChatAttachmentType[] | (FileUIPart & {id: string})[], onRemove?: (id: string) => void}){
    return <div className="flex items-center justify-center">
        <Attachments variant="grid">
            {files.map((attachment) => (
                <AttachmentHoverCard key={attachment.id}>
                    <AttachmentHoverCardTrigger asChild>
                        <Attachment
                            data={attachment}
                            onRemove={()=> onRemove && onRemove(attachment.id)}
                        >
                            <AttachmentPreview />
                            {onRemove && <AttachmentRemove />}
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