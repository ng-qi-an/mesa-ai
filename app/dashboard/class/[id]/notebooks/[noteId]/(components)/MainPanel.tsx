'use client';
import { useTabs } from "@/components/providers/tabs-provider";
import { TabItem } from "./(tabbar)/TabItem";
import { TabList } from "./(tabbar)/TabList";
import NotebookPanel from "./NotebookPanel";
import { Button } from "@/components/ui/button";
import { Sidebar } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useNotebook } from "@/components/providers/notebook-provider";
import { DraggableTabItem } from "./(tabbar)/DraggableTabItem";
import TabContent from "./(tabbar)/TabContent";

export default function MainPanel() {
    const { tabs } = useTabs();
    const { isMobile } = useSidebar();
    const {setCollapsedRightSidebar, collapsedRightSidebar} = useNotebook();
    return (
        <div className="flex flex-col h-full w-full rounded-t-lg border border-b-0 border-neutral-200 dark:border-neutral-900 bg-card h-full">
            <TabList group="main" className="w-full h-max shrink-y-0 z-30">
                <TabItem label={"Notebook"} id={"notebook"} group={"main"} />
                {tabs.main.length > 0 && tabs.main.map((tab, index) => (
                    <DraggableTabItem key={tab.id} label={tab.label} id={tab.id} index={index} group={"main"} closable />
                ))}
                <div className="flex-1"/>
                {!isMobile && <div className="flex items-center">
                    <Button onClick={()=> setCollapsedRightSidebar(!collapsedRightSidebar)} size={'icon-sm'} className="text-muted-foreground mr-2" variant={'ghost'}>
                        <Sidebar/>
                    </Button>
                </div>}
            </TabList>
            <div className="flex-1 relative h-full w-full">
                <TabContent tabId={"notebook"} group={"main"}>
                    <NotebookPanel />
                </TabContent>
                {tabs.main.length > 0 && tabs.main.map((tab) => (
                    <TabContent key={tab.id} tabId={tab.id} group={"main"}>
                        {tab.component}
                    </TabContent>
                ))}
            </div>
        </div>
    )
}