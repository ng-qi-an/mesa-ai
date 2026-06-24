import { useTabs } from "@/components/providers/tabs-provider";

export default function TabContent({children, tabId, group}: {children: React.ReactNode, tabId: string, group: string}) {
    const {selectedMainTab, selectedSideTab} = useTabs();
    const isSelected = group === "main" ? selectedMainTab === tabId : selectedSideTab === tabId;
    return (
        <div className={`h-full w-full absolute overflow-auto ${isSelected ? "z-30 pointer-events-auto" : "z-0 pointer-events-none opacity-0"}`}>
            {children}
        </div>
    )
}