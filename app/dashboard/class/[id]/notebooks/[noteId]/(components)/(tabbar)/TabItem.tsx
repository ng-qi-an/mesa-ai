import { cn } from "@/lib/utils";
import { useTabs } from "@/components/providers/tabs-provider";
import { X } from "lucide-react";

export function TabItem({label, id, group, ref, closable, isDragging}: {label: string, id: string, group: string, ref?: (element: Element | null) => void, closable?: boolean, isDragging?: boolean}) {
  const {selectedMainTab, setSelectedMainTab, selectedSideTab, setSelectedSideTab, closeTab, } = useTabs();
  const activeTab = group === "main" ? selectedMainTab : selectedSideTab;
  const setActiveTab = group === "main" ? setSelectedMainTab : setSelectedSideTab;
  return (
    <button
      ref={ref}
      className={cn(`px-5 pb-2 pt-3 ${closable && "pr-2 pl-2"} border-b-2 border-transparent ${isDragging && "bg-secondary rounded-t-lg"} transition-all group text-sm font-medium flex items-center -mb-px shrink-0`, activeTab == id ? "border-primary/80 dark:border-foreground/80 text-foreground/90 " : "text-muted-foreground hover:text-foreground/90")}
      onClick={()=> {console.log("tabbed clicked"); setActiveTab(id)}}
    >
      <span className="truncate max-w-30">
      {label}
      </span>
      {closable && (
        <span className={`ml-1 ${activeTab == id ? "text-muted-foreground" : "opacity-0 group-hover:opacity-100 group-hover:text-muted-foreground"}`} onClick={(e) => {
          e.stopPropagation();
          console.log("close clicked!");
          closeTab(id);
        }}>
          <X size={15} />
        </span>
      )}
    </button>
  );
}