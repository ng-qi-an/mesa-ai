import { useTabs } from "@/components/providers/tabs-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import { Minimize2 } from "lucide-react";

export default function ExpandMinimiseButton({className, tabId, disabled=false}: {className?: string, tabId?: string, disabled?: boolean}){
    const {moveTab, getTabGroup} = useTabs();
    const activeTabGroup = tabId ? getTabGroup(tabId) : undefined
    return <Button variant="ghost" size="icon-sm" disabled={!tabId || disabled} className={cn("text-muted-foreground shrink-0", className)} onClick={()=>{
        if (!tabId) return;
        moveTab(tabId, activeTabGroup === "side" ? "main" : "side")
    }}>
        {activeTabGroup == "side" ? <Maximize2 className="size-4"/> : <Minimize2 className="size-4"/>}
    </Button>
}