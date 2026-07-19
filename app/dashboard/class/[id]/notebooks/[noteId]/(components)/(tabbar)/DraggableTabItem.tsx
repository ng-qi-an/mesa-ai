import { useSortable } from "@dnd-kit/react/sortable";
import { TabItem } from "./TabItem";
import { LucideIcon } from "lucide-react";

export function DraggableTabItem({label, id, icon, index, group, closable}: {label: string, id: string, icon?: LucideIcon, index: number, group: string, closable?: boolean}) {
    const {ref, isDragging} = useSortable({id: id, index, group: group, type: "tab", accept: "tab"});

    return <TabItem label={label} id={id} icon={icon} ref={ref} group={group} closable={closable} isDragging={isDragging} />
}