import { cn } from "@/lib/utils";
import { useTabs } from "@/components/providers/tabs-provider";

export function TabItem({label, id, group, ref}: {label: string, id: string, group: string, ref?: (element: Element | null) => void}) {
  const {selectedMainTab, setSelectedMainTab, selectedSideTab, setSelectedSideTab} = useTabs();
  const activeTab = group === "main" ? selectedMainTab : selectedSideTab;
  const setActiveTab = group === "main" ? setSelectedMainTab : setSelectedSideTab;
  return (
    <button
      ref={ref}
      className={cn("px-5 pb-2 pt-3 border-b border-transparent text-sm font-medium -mb-px", activeTab == id ? "border-primary text-foreground/90 " : "text-muted-foreground")}
      onClick={()=> setActiveTab(id)}
    >
      {label}
    </button>
  );
}