'use client';
import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import getAddUserFileURL from "@/lib/r2actions/files/getAddUserFileUrl";
import { FileUIPart } from "ai";
import addFileToChatFilesDb from "../../../components/chat/addFileToChatFilesDb";

const fileHost = `http://mesa-ai.vercel.app`
export type ChatAttachmentType = FileUIPart & {
    id: string;
    drive: boolean;
}

export default async function SendChatMessage({message, files, sendMessage, thinkingLevel, chatId, bodyOptions}:{message: PromptInputMessage, files: ChatAttachmentType[], sendMessage: any, thinkingLevel: string, chatId: string, bodyOptions?: Record<string, any>}){
    try {
        let fileUploads;
        let finalFiles: (FileUIPart & { id: string })[] | undefined;
        if (files.length > 0) {
            const fileUrls = await getAddUserFileURL(message.files.filter((file)=> file.url).map((file) => ({ name: file.filename || "Untitled file", type: file.mediaType || "application/octet-stream" })));
            fileUploads = await Promise.all(
                fileUrls.map(async (signedUrl, index) => {
                    const file = message.files[index];
                    const blob = await fetch(file.url).then((response) => response.blob());
                    const response = await fetch(signedUrl.url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": file.mediaType || "application/octet-stream",
                        },
                        body: new File([blob], file.filename || `file-${index + 1}`, { type: file.mediaType || blob.type || "application/octet-stream" }),
                    });
                    if (response.ok) {
                        return {
                            id: signedUrl.id,
                            name: file.filename || `file-${index + 1}`,
                            mediaType: file.mediaType,
                            type: "file",
                            url: `${fileHost}/api/chat/file/${signedUrl.id}`,
                        } as FileUIPart & { id: string };
                    } else {
                        console.error(`Failed to upload ${file.filename || `file-${index + 1}`}`);
                        return {id: 'failed'};
                    }
                })
            );
            console.log("File uploads result:", fileUploads);

            const mesaFiles = files.filter((file) => file.drive);
            finalFiles = [...mesaFiles.map((f)=> {const {drive, ...rest} = f; return {...rest, url: `${fileHost}/api/chat/file/${f.id}`};}), ...fileUploads.filter((f) => f.id !== 'failed') as (FileUIPart & {id: string})[]];
            console.log("Final files to send with message:", finalFiles);
            if (finalFiles.length > 0) {
                await addFileToChatFilesDb({files: finalFiles, chatId: chatId});
            }
        }
        sendMessage({text: message.text, files: finalFiles ? finalFiles : []}, {
            body: {
                thinkingLevel,
                ...bodyOptions,
            },
        });
        
        if (fileUploads && fileUploads.find((f) => f.id === 'failed')) {
            return "failed_uploads";
        } else {
            return "success";
        }
    } catch (error) {
        console.error("Error sending message with attachments:", error);
        return "error";
    }
}