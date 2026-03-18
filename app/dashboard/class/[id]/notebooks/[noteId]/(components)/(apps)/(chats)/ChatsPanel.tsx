'use client';
import { useState } from "react";
import ChatMessagesPanel from "./ChatMessagesPanel";
import { ChatSelect } from "@/lib/schemas/schema";
import ChatsListPanel from "./ChatsListPanel";
export default function ChatsPanel({setSidebarTool}: {setSidebarTool: (tool: string) => void}){
    const [selectedChatId, setSelectedChatId] = useState("");
    const [chatsList, setChatsList] = useState<ChatSelect[]>([]);
    const activeChat = chatsList.find((x)=> x.id == selectedChatId);

    if (activeChat) {
        return <ChatMessagesPanel chat={activeChat} selectedChat={selectedChatId} setSelectedChatId={setSelectedChatId}/>;
    } else {
        return <ChatsListPanel setSidebarTool={setSidebarTool} chatsList={chatsList} setChatsList={setChatsList} selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId}/>;
    }
}