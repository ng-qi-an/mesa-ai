'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, FileText, ListTodo, MessageSquare, Mic, Minus, MoreVertical, WalletCards } from "lucide-react";
import { useContext } from "react";
import { motion } from "motion/react";
import { useNotebook } from "@/components/providers/notebook-provider";

export default function AppsPanel({setSidebarTool}: {setSidebarTool: (tool: string) => void}){
    const noteCtx = useNotebook();
    const isCollapsed = noteCtx.collapsedApps
    
    const Apps = [
        {
            name: "Flashcards",
            icon: WalletCards
        }, 
        {
            name: "Podcast",
            icon: Mic
        },
        {
            name: "Quiz",
            icon: ListTodo
        },
        {
            name: "Chat",
            icon: MessageSquare
        }
    ]
    return <Card size="sm" className={`rounded-md ring-neutral-200 dark:ring-neutral-900 ${isCollapsed ? "h-max shrink-0 gap-0!" : "h-full"}`}>
            <CardHeader className="items-center group flex cursor-pointer relative">
                <motion.div
                    animate={{ rotate: !isCollapsed ? 0 : -90 }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                >
                    <ChevronDown className="text-muted-foreground group-hover:text-foreground size-4"/>
                </motion.div>
                <CardTitle 
                onClick={()=> {
                    if (noteCtx?.collapsedApps){
                        noteCtx?.setCollapsedApps(false);
                    } else {
                        noteCtx?.setCollapsedApps(true);
                        if (noteCtx?.collapsedSources){
                            noteCtx?.setCollapsedSources(false);
                        }
                    }
                }} 
                className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                    Apps
                </CardTitle>
            </CardHeader>
            <motion.div 
                className="grid h-full"
                initial={false}
                animate={{ gridTemplateRows: isCollapsed ? "0fr" : "1fr", opacity: isCollapsed ? 0 : 1 }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            >
                <div className="overflow-hidden h-full">
                    {!isCollapsed && <Separator className="mb-2" />}
                    <div className="h-full px-2 pb-2 overflow-auto">
                    <div className="grid grid-cols-2 gap-2 h-max w-full mb-2">
                        {Apps.map((tool) => (
                            <div key={tool.name} className="w-full px-4 py-3 flex flex-col group cursor-pointer bg-secondary/50 hover:bg-secondary rounded-md gap-2" onClick={() => {noteCtx?.setCollapsedSources(true); setSidebarTool(tool.name)}}>
                                <tool.icon className="size-5 text-muted-foreground group-hover:text-foreground"/>
                                <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{tool.name}</p>
                            </div>
                        ))}
                    </div>
                    {[...Array(10)].map((_, index) => (
                        <div key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-2 py-2 rounded-md w-full">
                            <ListTodo className="text-muted-foreground group-hover:text-foreground size-5.5"/>
                            <div className="flex flex-col">
                                <p className="truncate text-sm w-full font-medium">
                                    Weather Quiz
                                </p>
                                <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                                    Quiz - 1 minute ago
                                </p>
                            </div>
                            <Button size={'icon-sm'} className="text-muted-foreground ml-auto" variant={'ghost'}>
                                <MoreVertical/>
                            </Button>
                        </div>
                    ))}
                    </div>
                </div>
            </motion.div>
        </Card>
}