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
    const [selectedSideTab, setSelectedSideTab] = useState("chat");
    return (
        <TabsContext.Provider value={{ mainTabs, setMainTabs, sideTabs, setSideTabs, selectedMainTab, setSelectedMainTab, selectedSideTab, setSelectedSideTab }}>
            <DragDropProvider onDragEnd={(event)=>{
                if (event.canceled) return;
                const {source} = event.operation;
                if (isSortable(source)) {
                    const {initialIndex, index, initialGroup, group} = source;

                    // if (initialGroup === group) {
                    //     // Same group: reorder within the list
                    //     const groupItems = [...items[group]];
                    //     const [removed] = groupItems.splice(initialIndex, 1);
                    //     groupItems.splice(index, 0, removed);
                    //     items = {...items, [group]: groupItems};
                    // } else {
                    // // Cross-group transfer
                    //     const sourceItems = [...items[initialGroup]];
                    //     const [removed] = sourceItems.splice(initialIndex, 1);
                    //     const targetItems = [...items[group]];
                    //     targetItems.splice(index, 0, removed);
                    //     items = {...items, [initialGroup]: sourceItems, [group]: targetItems};
                    // }
                }

            }}>
                {children}
            </DragDropProvider>
        </TabsContext.Provider>
    );
}
