import { motion } from "motion/react";
import SourcesPanel from "../SourcesPanel";
import ToolsPanel from "../ToolsPanel";
import { useContext, useState } from "react";
import { NotebookContext } from "@/lib/contexts";
import ChatsPanel from "../(tools)/ChatsPanel";

export default function RightNotebookSidebar(){
    const noteCtx = useContext(NotebookContext);
    const [sidebarTool, setSidebarTool] = useState("");
    return <motion.div 
        layout
        animate={{
            width: noteCtx?.collapsedRightSidebar ? 0 : 350,
            opacity: noteCtx?.collapsedRightSidebar ? 0 : 1
        }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        className="h-full flex flex-col gap-3 shrink-0 overflow-hidden">
        <div className="w-[350px] h-full flex flex-col gap-3">
            
            {sidebarTool == "Chat" ?
                <ChatsPanel setSidebarTool={setSidebarTool}/>
            : <>
                <SourcesPanel/>
                <ToolsPanel setSidebarTool={setSidebarTool}/>
            </>
            }
        </div>
    </motion.div>
}