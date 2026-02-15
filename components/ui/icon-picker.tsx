import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { DynamicIcon, type IconName, iconNames as rawIcons } from 'lucide-react/dynamic';
import { Button } from "./button";
import { Grid } from "react-window";
import { useState, useMemo, useCallback, memo } from "react";
import { Input } from "./input";

const COLUMN_COUNT = 6;
const CELL_SIZE = 48; // px per cell
const GRID_HEIGHT = 200;

// react-window v2 uses cellComponent (not children) with these props
interface CellProps {
    columnIndex: number;
    rowIndex: number;
    selected: string,
    style: React.CSSProperties;
    data: IconName[];
    onSelect?: (name: IconName) => void;
}

const IconCell = memo(function IconCell({ columnIndex, rowIndex, style, selected, data, onSelect }: CellProps) {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    if (index >= data.length) return <div style={style} />;
    const name = data[index];
    return (
        <div style={style} className="flex items-center justify-center">
            <Button
                variant={selected === name ? "default" : "ghost"}
                size="icon-lg"
                title={name}
                onClick={() => onSelect?.(name)}
            >
                <DynamicIcon name={name} className="size-5" />
            </Button>
        </div>
    );
});

export default function IconPicker({
    open,
    onOpenChange,
    children,
    selected,
    onSelect,
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    selected: string;
    children?: React.ReactNode;
    onSelect?: (name: IconName) => void;
}) {
    const specialIcons = ['presentation', 'globe', 'scroll', 'drafting-compass', 'ruler-dimension-line', 'atom', 'stethoscope', 'book-open-text'];
    const iconNames = [...specialIcons, ...rawIcons.filter(name => !specialIcons.includes(name))];
    const [search, setSearch] = useState("");

    const filteredNames = useMemo(() => {
        if (!search) return iconNames;
        const lower = search.toLowerCase();
        return iconNames.filter((name) => name.toLowerCase().includes(lower));
    }, [search]);

    const rowCount = Math.ceil(filteredNames.length / COLUMN_COUNT);

    const cellProps = useMemo(() => ({
        data: filteredNames,
        onSelect,
        selected,
    }), [filteredNames, selected, onSelect]);

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            {children && <PopoverTrigger asChild>{children}</PopoverTrigger>}
            <PopoverContent className="w-max p-3">
                <div className="grid gap-3">
                    <Input
                        placeholder="Search icons..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 text-sm"
                    />
                    {filteredNames.length > 0 ?<Grid
                        // @ts-ignore
                        cellComponent={IconCell}
                        // @ts-ignore
                        cellProps={cellProps}
                        columnCount={COLUMN_COUNT}
                        columnWidth={CELL_SIZE}
                        rowCount={rowCount}
                        rowHeight={CELL_SIZE}
                        style={{ height: GRID_HEIGHT, width: COLUMN_COUNT * CELL_SIZE }}
                        className="overscroll-contain"
                    /> : (
                        <p style={{ height: GRID_HEIGHT, width: COLUMN_COUNT * CELL_SIZE }} className="text-muted-foreground text-center text-xs py-4">
                            No icons found.
                        </p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}