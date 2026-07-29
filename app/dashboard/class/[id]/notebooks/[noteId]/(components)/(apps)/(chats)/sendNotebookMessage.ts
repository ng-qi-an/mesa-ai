import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { AIExtension, AIRequest, sendMessageWithAIRequest } from "@blocknote/xl-ai";
import { buildNotebookAIRequest } from "./buildNotebookAIRequest";
import { Chat, UIMessage } from "@ai-sdk/react";
import { RefObject } from "react";
import { clearNotebookAICursor } from "./notebookAICursor";

export async function sendNotebookMessage({message, editor, notebookChat, activeAIRequest, setActiveAIRequest, setHasPendingAIChanges, notebookEditedRef, chatId, _class, thinkingLevel, noteId, selectedModel}:{message: PromptInputMessage, editor: any, notebookChat: any, activeAIRequest: AIRequest | null, setActiveAIRequest: (request: AIRequest | null) => void, setHasPendingAIChanges: (value: boolean) => void, notebookEditedRef: RefObject<boolean>, chatId: string, _class: any, thinkingLevel: string, noteId: string, selectedModel: string}) {
    const aiExtension = editor.getExtension(AIExtension);

    if (!aiExtension) {
        throw new Error("BlockNote AI extension is not registered.");
    }
    notebookEditedRef.current = false
    const aiRequest = activeAIRequest ?? (await buildNotebookAIRequest(editor, notebookEditedRef));
    const result = await sendMessageWithAIRequest(
        notebookChat as unknown as Chat<UIMessage>, 
        aiRequest,
        {text: message.text},
        {body: {
            chatId,
            classId: _class.id,
            noteId: noteId,
            subject: _class.subject,
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
        setHasPendingAIChanges(true);

        // Keep BlockNote in review mode so autosave remains blocked until the
        // user explicitly applies or rejects the staged changes.
        aiExtension.setAIResponseStatus("user-reviewing");
    }
}