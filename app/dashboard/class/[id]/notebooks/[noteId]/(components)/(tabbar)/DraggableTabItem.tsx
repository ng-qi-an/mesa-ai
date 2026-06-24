import { useSortable } from "@dnd-kit/react/sortable";
import { TabItem } from "./TabItem";

export function DraggableTabItem({label, id, index, group}: {label: string, id: string, index: number, group: string}) {
    const {ref} = useSortable({id: id, index, group: group});

    return <TabItem label={label} id={id} ref={ref} group={group} />
}