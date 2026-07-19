'use client';
import { useState } from "react";
import { ChatSelect } from "@/lib/schemas/schema";
export default function ChatsPanel({setSidebarTool}: {setSidebarTool: (tool: string) => void}){
    const [selectedChatId, setSelectedChatId] = useState("");
    const [chatsList, setChatsList] = useState<ChatSelect[]>([]);
    const activeChat = chatsList.find((x)=> x.id == selectedChatId);
    return <></>
}