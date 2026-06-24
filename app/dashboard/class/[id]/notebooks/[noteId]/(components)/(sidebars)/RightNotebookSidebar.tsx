import { motion } from "motion/react";
import SourcesPanel from "../SourcesPanel";
import AppsPanel from "../AppsPanel";
import { useState } from "react";
import ChatsPanel from "../(apps)/(chats)/ChatsPanel";
import { useNotebook } from "@/components/providers/notebook-provider";
import QuizControllerPanel from "../(apps)/(quiz)/QuizControllerPanel";
import { useSidebar } from "@/components/ui/sidebar";
import { TabList } from "../(tabbar)/TabList";
import { useTabs } from "@/components/providers/tabs-provider";
import { TabItem } from "../(tabbar)/TabItem";
import { DraggableTabItem } from "../(tabbar)/DraggableTabItem";

export default function RightNotebookSidebar(){
    const noteCtx = useNotebook();
    const {isMobile} = useSidebar();
    const [sidebarTool, setSidebarTool] = useState("");
    const { sideTabs } = useTabs();
    return <div className="h-full flex flex-col gap-3">
        <div className="flex flex-col h-full rounded-tl-lg border border-r-0 border-b-0 border-neutral-200 dark:border-neutral-900 bg-card h-full">
            <TabList>
                <TabItem label={"Chat"} id={"chat"} group={"side"} />
                <TabItem label={"Library"} id={"library"} group={"side"} />
                {sideTabs.map((tab, index) => (
                    <DraggableTabItem key={tab.id} label={tab.label} id={tab.id} index={index} group={"side"} />
                ))}
            </TabList>
            <AppsPanel setSidebarTool={setSidebarTool}/>
        </div>
    </div>
}