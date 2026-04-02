import { motion } from "motion/react";
import SourcesPanel from "../SourcesPanel";
import AppsPanel from "../AppsPanel";
import { useState } from "react";
import ChatsPanel from "../(apps)/(chats)/ChatsPanel";
import { useNotebook } from "@/components/providers/notebook-provider";
import QuizPanel from "../(apps)/(quiz)/QuizPanel";

export default function RightNotebookSidebar(){
    const noteCtx = useNotebook();
    const [sidebarTool, setSidebarTool] = useState("");
    return <motion.div 
        layout
        animate={{
            width: noteCtx.collapsedRightSidebar ? 0 : 400,
            opacity: noteCtx.collapsedRightSidebar ? 0 : 1
        }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        className="h-full flex flex-col gap-3 shrink-0">
        <div className="w-[400px] h-full flex flex-col gap-3">
            
            {sidebarTool == "Chat" ?
                <ChatsPanel setSidebarTool={setSidebarTool}/>
            : sidebarTool == "Quiz" ?
                <QuizPanel setSidebarTool={setSidebarTool}/>
            : <>
                <SourcesPanel/>
                <AppsPanel setSidebarTool={setSidebarTool}/>
            </>
            }
        </div>
    </motion.div>
}