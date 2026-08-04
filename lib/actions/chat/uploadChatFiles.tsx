import { FileUIPart } from "ai";
import saveToChat from "./saveToChat";
import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { ChatAttachmentType } from "./sendChatMessage";
import getAddUserFileURL from "@/lib/r2actions/files/getAddUserFileUrl";
import addFileToChatFilesDb from "@/components/chat/addFileToChatFilesDb";

const fileHost = `https://mesa-ai.vercel.app`

export default async function uploadChatFiles({message, files, chatId}:{message: PromptInputMessage, files: ChatAttachmentType[], chatId: string}){
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
    return finalFiles ? finalFiles : [];
}