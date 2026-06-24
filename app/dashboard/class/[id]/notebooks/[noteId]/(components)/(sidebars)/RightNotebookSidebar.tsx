import AppsPanel from "../AppsPanel";
import { useState } from "react";
import ChatsPanel from "../(apps)/(chats)/ChatsPanel";
import { useNotebook } from "@/components/providers/notebook-provider";
import { useSidebar } from "@/components/ui/sidebar";
import { TabList } from "../(tabbar)/TabList";
import { useTabs } from "@/components/providers/tabs-provider";
import { TabItem } from "../(tabbar)/TabItem";
import { DraggableTabItem } from "../(tabbar)/DraggableTabItem";
import TabContent from "../(tabbar)/TabContent";

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
                    <DraggableTabItem key={tab.id} label={tab.label} id={tab.id} closable={true} index={index} group={"side"} />
                ))}
            </TabList>
            <div className="flex-1 relative h-full w-full">
                <TabContent tabId={"chat"} group={"side"}>
                    <ChatsPanel setSidebarTool={setSidebarTool}/>
                </TabContent>
                <TabContent tabId={"library"} group={"side"}>
                    <AppsPanel setSidebarTool={setSidebarTool}/>
                </TabContent>
                {sideTabs.map((tab) => (
                    <TabContent key={tab.id} tabId={tab.id} group={"side"}>
                        {tab.component}
                    </TabContent>
                ))}
            </div>
        </div>
    </div>
}