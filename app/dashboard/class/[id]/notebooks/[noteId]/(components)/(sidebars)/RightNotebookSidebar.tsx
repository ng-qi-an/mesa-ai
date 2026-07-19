import { TabList } from "../(tabbar)/TabList";
import { useTabs } from "@/components/providers/tabs-provider";
import { TabItem } from "../(tabbar)/TabItem";
import { DraggableTabItem } from "../(tabbar)/DraggableTabItem";
import TabContent from "../(tabbar)/TabContent";
import LibraryPanel from "../(library)/LibraryPanel";
import ChatMessagesPanel from "../(apps)/(chats)/ChatMessagesPanel";

export default function RightNotebookSidebar(){
    const { tabs } = useTabs();
    return <div className="h-full flex flex-col gap-3">
        <div className="flex flex-col h-full rounded-lg border border-neutral-200 dark:border-neutral-900 bg-card h-full">
            <TabList group="side">
                <TabItem label={"Chat"} id={"chat"} group={"side"} />
                <TabItem label={"Library"} id={"library"} group={"side"} />
                {tabs.side.length > 0 && tabs.side.map((tab, index) => (
                    <DraggableTabItem icon={tab.icon} key={tab.id} label={tab.label} id={tab.id} closable={true} index={index} group={"side"} />
                ))}
            </TabList>
            <div className="flex-1 relative h-full w-full">
                <TabContent tabId={"chat"} group={"side"}>
                    <ChatMessagesPanel isMainChat chatName={"New Chat"}/>
                </TabContent>
                <TabContent tabId={"library"} group={"side"}>
                    <LibraryPanel/>
                </TabContent>
                {tabs.side.length > 0 && tabs.side.map((tab) => (
                    <TabContent key={tab.id} tabId={tab.id} group={"side"}>
                        {tab.component}
                    </TabContent>
                ))}
            </div>
        </div>
    </div>
}