import { useSortable } from "@dnd-kit/react/sortable";
import { TabItem } from "./TabItem";

export function DraggableTabItem({label, id, index, group, closable}: {label: string, id: string, index: number, group: string, closable?: boolean}) {
    const {ref, isDragging} = useSortable({id: id, index, group: group, type: "tab", accept: "tab"});

    return <TabItem label={label} id={id} ref={ref} group={group} closable={closable} isDragging={isDragging} />
}