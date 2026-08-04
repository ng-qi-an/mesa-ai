import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { AIExtension, AIRequest, sendMessageWithAIRequest } from "@blocknote/xl-ai";
import { buildNotebookAIRequest } from "./buildNotebookAIRequest";
import { Chat, UIMessage } from "@ai-sdk/react";
import { RefObject } from "react";
import { FileUIPart } from "ai";
import { BlockNoteEditor } from "@blocknote/core";

export async function sendNotebookMessage({message, files, editor, notebookChat, activeAIRequest, setActiveAIRequest, setHasPendingAIChanges, notebookEditedRef, beforeNotebookEditRef, chatId, _class, thinkingLevel, noteId, selectedModel}:{message: PromptInputMessage, files: (FileUIPart & { id: string })[] | undefined, editor: BlockNoteEditor<any, any, any>, notebookChat: any, activeAIRequest: AIRequest | null, setActiveAIRequest: (request: AIRequest | null) => void, setHasPendingAIChanges: (value: boolean) => void, notebookEditedRef: RefObject<boolean>, beforeNotebookEditRef: RefObject<any[] | null>, chatId: string, _class: any, thinkingLevel: string, noteId: string, selectedModel: string}) {
    const aiExtension = editor.getExtension(AIExtension);
    console.log("Preparing to send message")
    if (!aiExtension) {
        throw new Error("BlockNote AI extension is not registered.");
    }
    notebookEditedRef.current = false
    const aiRequest = activeAIRequest ?? (await buildNotebookAIRequest(editor, notebookEditedRef, beforeNotebookEditRef));
    const result = await sendMessageWithAIRequest(
        notebookChat as unknown as Chat<UIMessage>, 
        aiRequest,
        {text: message.text, files},
        {body: {
            chatId,
            classId: _class.id,
            noteId: noteId,
            subject: _class.subject,
            markdown: editor.blocksToMarkdownLossy(),
            thinkingLevel,
            selectedModel,
        }},
    );
    if (!result.ok) {
        console.log("Error occured during message sending", result.error);
        setActiveAIRequest(null);
        setHasPendingAIChanges(false);
        throw result.error;
    }
    if (notebookEditedRef.current) {
        console.log("Notebook was edited by AI, setting hasPendingAIChanges to true");
        setHasPendingAIChanges(true);

        // Keep BlockNote in review mode so autosave remains blocked until the
        // user explicitly applies or rejects the staged changes.
        aiExtension.setAIResponseStatus("user-reviewing");
    }
}