import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import getAddUserFileURL from "@/lib/r2actions/files/getAddUserFileUrl";
import { chatFiles } from "@/lib/schemas/schema";
import { FileUIPart } from "ai";
import addFileToChatFilesDb from "./addFileToChatFilesDb";

const fileHost = `http://mesa-ai.vercel.app`

export default async function SendChatMessage({message, files, sendMessage, thinkingLevel, chatId, bodyOptions}:{message: PromptInputMessage, files: (FileUIPart & {id: string})[], sendMessage: any, thinkingLevel: string, chatId: string, bodyOptions: Record<string, any>}){
    const fileUrls = await getAddUserFileURL(message.files.map((file) => ({ name: file.filename || "Untitled file", type: file.mediaType || "application/octet-stream" })));
    try {
        const fileUploads = await Promise.all(
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
        const mesaFiles = files.filter((file) => !fileUploads.some((f) => f.id === file.id));
        const finalFiles: (FileUIPart & { id: string })[] = [...mesaFiles.map((f)=> ({...f, url: `${fileHost}/api/chat/file/${f.id}`})), ...fileUploads.filter((f) => f.id !== 'failed') as (FileUIPart & {id: string})[]];
        if (finalFiles.length > 0) {
            await addFileToChatFilesDb({files: finalFiles, chatId: chatId});
        }

        sendMessage({text: message.text, files: finalFiles}, {
            body: {
                thinkingLevel,
                ...bodyOptions,
            },
        });
        
        if (fileUploads.find((f) => f.id === 'failed')) {
            return "failed_uploads";
        } else {
            return "success";
        }
    } catch (error) {
        console.error("Error sending message with attachments:", error);
        return "error";
    }
}