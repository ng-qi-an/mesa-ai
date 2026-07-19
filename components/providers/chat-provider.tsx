'use client';

import { ChatAttachmentType } from "@/lib/actions/chat/sendChatMessage";
import { ThinkingLevels } from "@/lib/utils/models";
import { createContext, useContext, Dispatch, ReactNode, SetStateAction } from "react";

export type ChatContextType = {
    newText: string;
    setNewText: (text: string) => void;
    newFiles: ChatAttachmentType[];
    setNewFiles: Dispatch<SetStateAction<ChatAttachmentType[]>>;
    newThinkingLevel: ThinkingLevels;
    setNewThinkingLevel: (level: ThinkingLevels) => void;
    newSelectedModel: string;
    setNewSelectedModel: (model: string) => void;
    loadingChatName: boolean;
    setLoadingChatName: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}
export function ChatProvider({children, value}: {children: ReactNode, value: ChatContextType}) {
    return <ChatContext.Provider value={value}>
        {children}
     </ChatContext.Provider>
}

