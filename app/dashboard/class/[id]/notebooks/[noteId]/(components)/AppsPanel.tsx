'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ListTodo, MessageSquare, Mic, MoreVertical, WalletCards } from "lucide-react";
import { motion } from "motion/react";
import { useNotebook } from "@/components/providers/notebook-provider";
import { useSidebar } from "@/components/ui/sidebar";

export default function AppsPanel({setSidebarTool}: {setSidebarTool: (tool: string) => void}){
    const noteCtx = useNotebook();
    const isCollapsed = noteCtx.collapsedApps
    const {isMobile} = useSidebar();
    
    const Apps = [
        {
            name: "Chat",
            icon: MessageSquare
        },
        {
            name: "Quiz",
            icon: ListTodo
        },
        {
            name: "Flashcards",
            icon: WalletCards,
            disabled: true
        }, 
        {
            name: "Podcast",
            icon: Mic,
            disabled: true
        },
    ]
    return <div className="h-full pb-2 p-4 overflow-auto bg-card">
        <div className="grid grid-cols-2 gap-2 h-max w-full mb-2">
            {Apps.map((tool) => (
                <div key={tool.name} className={`w-full px-4 py-3 flex flex-col group cursor-pointer rounded-md gap-2 bg-secondary/50 ${tool.disabled ? 'opacity-50 cursor-default pointer-events-none' : 'hover:bg-secondary'}`} onClick={() =>{ if (!tool.disabled) { noteCtx?.setCollapsedSources(true); setSidebarTool(tool.name) } }}>
                    <tool.icon className="size-5 text-muted-foreground group-hover:text-foreground"/>
                    <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{tool.name}</p>
                </div>
            ))}
        </div>
    </div>
}