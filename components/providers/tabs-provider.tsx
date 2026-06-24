import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { createContext, useContext, useState } from "react";

type TabsContextType = {
    mainTabs: TabItemType[];
    setMainTabs: React.Dispatch<React.SetStateAction<TabItemType[]>>;
    sideTabs: TabItemType[];
    setSideTabs: React.Dispatch<React.SetStateAction<TabItemType[]>>;
    selectedMainTab: string;
    setSelectedMainTab: React.Dispatch<React.SetStateAction<string>>;
    selectedSideTab: string;
    setSelectedSideTab: React.Dispatch<React.SetStateAction<string>>;
    addOrGoToTab: (tab: TabItemType, group: "main" | "side") => void;
    closeTab: (tabId: string, group: "main" | "side") => void;
}

export type TabItemType = {
    label: string;
    icon?: any;
    id: string;
    component: React.ReactNode;
}

export const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function useTabs() {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("useTabs must be used within a TabsProvider");
    }
    return context;
}


export default function TabsProvider({children}: {children: React.ReactNode}) {
    const [mainTabs, setMainTabs] = useState<TabItemType[]>([]);
    const [selectedMainTab, setSelectedMainTab] = useState("notebook");
    const [sideTabs, setSideTabs] = useState<TabItemType[]>([]);
    const [selectedSideTab, setSelectedSideTab] = useState("library");
    function addOrGoToTab(tab: TabItemType, group: "main" | "side"){
        const existingTabInOtherGroup = group === "side" ? mainTabs.find(t => t.id === tab.id) : sideTabs.find(t => t.id === tab.id);
        if (existingTabInOtherGroup) {
            if (group === "side") {
                setSelectedMainTab(tab.id);
            } else {
                setSelectedSideTab(tab.id);
            }
            return;
        }
        const existingTab = group === "side" ? sideTabs.find(t => t.id === tab.id) : mainTabs.find(t => t.id === tab.id);
        if (existingTab) {
            if (group === "side") {
                setSelectedSideTab(tab.id);
            } else {
                setSelectedMainTab(tab.id);
            }
            return;
        }
        if (group === "side") {
            setSideTabs([...sideTabs, tab]);
            setSelectedSideTab(tab.id);
        } else {
            setMainTabs([...mainTabs, tab]);
            setSelectedMainTab(tab.id);
        }
    }
    function closeTab(tabId: string, group: "main" | "side") {
        const newTabs = group === "side" ? sideTabs.filter(t => t.id !== tabId) : mainTabs.filter(t => t.id !== tabId);
        const setTabs = group === "side" ? setSideTabs : setMainTabs;
        const setSelectedTab = group === "side" ? setSelectedSideTab : setSelectedMainTab;
        setTabs(newTabs);
        if (selectedSideTab === tabId) {
            setSelectedTab(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : group === "side" ? "library" : "notebook");
        }
    }
    return (
        <TabsContext.Provider value={{ mainTabs, setMainTabs, sideTabs, setSideTabs, selectedMainTab, setSelectedMainTab, selectedSideTab, setSelectedSideTab, addOrGoToTab, closeTab }}>
            <DragDropProvider onDragEnd={(event)=>{
                if (event.canceled) return;
                const {source} = event.operation;
                if (isSortable(source)) {
                    const {initialIndex, index, initialGroup, group} = source;
                    if (initialGroup === group) {
                        // Same group: reorder within the list
                        const groupItems = group === "main" ? [...mainTabs] : [...sideTabs];
                        const [removed] = groupItems.splice(initialIndex, 1);
                        groupItems.splice(index, 0, removed);
                        if (group === "main") {
                            setMainTabs(groupItems);
                            setSelectedMainTab(removed.id);
                        } else {
                            setSideTabs(groupItems);
                            setSelectedSideTab(removed.id);
                        }

                    } else {
                        // Different groups: move between lists
                        const sourceItems = initialGroup === "main" ? [...mainTabs] : [...sideTabs];
                        const targetItems = group === "main" ? [...mainTabs] : [...sideTabs];
                        const [removed] = sourceItems.splice(initialIndex, 1);
                        targetItems.splice(index, 0, removed);
                        if (initialGroup === "main") {
                            setMainTabs(sourceItems);
                            setSideTabs(targetItems);
                        } else {
                            setSideTabs(sourceItems);
                            setMainTabs(targetItems);
                        }
                    }
                }

            }}>
                {children}
            </DragDropProvider>
        </TabsContext.Provider>
    );
}
