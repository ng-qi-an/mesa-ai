import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { createContext, useContext, useRef, useState } from "react";
import {move} from '@dnd-kit/helpers';

type TabsContextType = {
    tabs: Record<string, TabItemType[]>;
    setTabs: React.Dispatch<React.SetStateAction<Record<string, TabItemType[]>>>;
    selectedMainTab: string;
    setSelectedMainTab: React.Dispatch<React.SetStateAction<string>>;
    selectedSideTab: string;
    setSelectedSideTab: React.Dispatch<React.SetStateAction<string>>;
    addOrGoToTab: (tab: TabItemType, group: "main" | "side") => void;
    closeTab: (tabId: string) => void;
    moveTab: (tabId: string, toGroup: "main" | "side") => void;
    getTabGroup: (tabId: string) => "main" | "side" | undefined;
}

export type TabItemType = {
    label: string;
    icon?: React.ElementType;
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
    const [tabs, setTabs] = useState<Record<string, TabItemType[]>>({
        main: [],
        side: [],
    });
    const tabsSnapshotRef = useRef<Record<string, TabItemType[]>>({
        main: [],
        side: [],
    });
    const [selectedMainTab, setSelectedMainTab] = useState<string>("notebook");
    const [selectedSideTab, setSelectedSideTab] = useState<string>("library");

    function getFallbackTab(group: "main" | "side", items: TabItemType[]) {
        return items.length > 0 ? items[items.length - 1].id : group === "main" ? "notebook" : "library";
    }

    function syncSelectionAfterMove(nextTabs: Record<"main" | "side", TabItemType[]>, tabId: string | number) {
        const selectedTabId = String(tabId);
        const isInMain = nextTabs.main.some(tab => tab.id === selectedTabId);
        const isInSide = nextTabs.side.some(tab => tab.id === selectedTabId);

        if (isInMain && !isInSide) {
            setSelectedMainTab(selectedTabId);
            setSelectedSideTab(getFallbackTab("side", nextTabs.side));
            return;
        }

        if (isInSide && !isInMain) {
            setSelectedSideTab(selectedTabId);
            setSelectedMainTab(getFallbackTab("main", nextTabs.main));
            return;
        }

        if (isInMain) {
            setSelectedMainTab(selectedTabId);
        }
        if (isInSide) {
            setSelectedSideTab(selectedTabId);
        }
    }
    function findTab(tabId: string) {
        return Object.values(tabs).flat().find(t => t.id === tabId);
    }
    function getTabGroup(tabId: string){
        return Object.keys(tabs).find(group => {
            if (tabs[group].find(t => t.id === tabId)) {
                return true;
            } else {
                return false;
            }
        }) as "main" | "side" | undefined;
    }
    function addOrGoToTab(tab: TabItemType, group: "main" | "side"){
        const existingTab = findTab(tab.id);
        console.log("existingTab", existingTab);
        if (existingTab){
            if (getTabGroup(tab.id) === "main") {
                return setSelectedMainTab(tab.id);
            } else {
               return setSelectedSideTab(tab.id);
            }
        }
        setTabs({...tabs, [group]: [...tabs[group], tab]});
        if (group === "side") {
            setSelectedSideTab(tab.id);
        } else {
            setSelectedMainTab(tab.id);
        }
    }
    function closeTab(tabId: string) {
        const group = getTabGroup(tabId);
        if (!group) return;
        const newTabs = {...tabs, [group]: tabs[group].filter(t => t.id !== tabId)};
        const setSelectedTab = group === "side" ? setSelectedSideTab : setSelectedMainTab;
        setTabs(newTabs);
        const selectedTab = group === "side" ? selectedSideTab : selectedMainTab;
        if (selectedTab === tabId) {
            setSelectedTab(getFallbackTab(group, newTabs[group]));
        }
    }
    function moveTab(tabId: string, toGroup: string) {
        const existingTab = findTab(tabId);
        console.log("movetab: existingTab", existingTab);
        if (!existingTab) return;
        const group = getTabGroup(tabId);
        console.log("movetab: group", group);
        if (!group) return;
        const filteredTabs: Record<string, TabItemType[]> = {...tabs, [group]: tabs[group].filter(t => t.id !== tabId)};
        setTabs(filteredTabs);
        if (group === "main") {
            setSelectedMainTab(filteredTabs[group]!.length > 0 ? filteredTabs[group][filteredTabs[group].length - 1].id : "notebook");
        } else {
            setSelectedSideTab(filteredTabs[group]!.length > 0 ? filteredTabs[group][filteredTabs[group].length - 1].id : "library");
        }
        setTabs({...filteredTabs, [toGroup]: [...filteredTabs[toGroup], existingTab]});
        if (toGroup === "main") {
            setSelectedMainTab(tabId);
        } else {
            setSelectedSideTab(tabId);
        }
    }

    return (
        <TabsContext.Provider value={{ tabs, setTabs, selectedMainTab, setSelectedMainTab, selectedSideTab, setSelectedSideTab, addOrGoToTab, closeTab, getTabGroup, moveTab }}>
            <DragDropProvider
                onDragStart={() => {
                    tabsSnapshotRef.current = {
                        main: [...tabs.main],
                        side: [...tabs.side],
                    };
                }}
                onDragOver={(event) => {
                    const {source} = event.operation;
                    if (!isSortable(source)) {
                        return;
                    }

                    const moveTabs = move as unknown as (
                        items: Record<"main" | "side", TabItemType[]>,
                        dragEvent: unknown,
                    ) => Record<"main" | "side", TabItemType[]>;
                    const nextTabs = moveTabs(tabs as Record<"main" | "side", TabItemType[]>, event);

                    setTabs(nextTabs);
                    syncSelectionAfterMove(nextTabs, source.id);
                }}
                onDragEnd={(event) => {
                    if (event.canceled) {
                        setTabs(tabsSnapshotRef.current);
                        return;
                    }
                }}
            >
                {children}
            </DragDropProvider>
        </TabsContext.Provider>
    );
}
