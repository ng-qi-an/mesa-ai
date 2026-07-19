import { ChevronRight } from "lucide-react";
import LibraryItem from "./LibraryItem";

export type LibraryItemType = {
    label: string;
    id: string;
    description?: string;
    type: string;
}

export default function LibraryItemGroup({label, items, onLabelClick, limit, setItems}: {label: string, items: LibraryItemType[], onLabelClick?: (key: string) => void, limit?: number, setItems: React.Dispatch<React.SetStateAction<Record<string, any[]>>>}){
    return <div className="flex flex-col gap-1">
        <p className={`font-medium text-muted-foreground text-sm mb-2 flex gap-1 pr-3 pl-2 items-center capitalize ${onLabelClick ? 'cursor-pointer hover:text-foreground' : ''}`} onClick={() => onLabelClick && onLabelClick(label)}>
            {label}
            {onLabelClick && <ChevronRight size="15" className="ml-auto"/>}
        </p>
        {(limit ? items.toSpliced(limit) : items).map((item, index) => <LibraryItem key={index} item={item} setItems={setItems}/>)}
        {limit && items.length > limit && <p className="text-sm text-center text-muted-foreground mt-2 cursor-pointer hover:text-foreground" onClick={() => onLabelClick && onLabelClick(label)}>View {items.length - limit} more items</p>}
    </div>
}