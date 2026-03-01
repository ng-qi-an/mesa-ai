
import { FileSelect } from "@/lib/schemas/schema"
import { mimeToReadable } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, File, Folder, MoreHorizontal } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import FileRowActions from "./FileRowActions"

export const checkboxColumn:ColumnDef<FileBrowserItem> = {
    id: "select",
    cell: ({ row, table }) => {
        const meta = table.options.meta as { selected: string[], setSelected: (selected: string[]) => void }
        const file = row.original    
        return file.contentType != "application/x-directory" && <Checkbox
            checked={meta.selected.includes(file.id)}
            onCheckedChange={(value) => value ? meta.setSelected([...meta.selected, file.id]) : meta.setSelected(meta.selected.filter(id => id !== file.id))}
            aria-label="Select row"
        />
    },
    enableSorting: false,
    enableHiding: false,
}

export const fileColumns: ColumnDef<FileBrowserItem>[] = [
    
    {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="-ml-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    {column.getIsSorted() && (column.getIsSorted() === "desc" ?  <ArrowDown className="ml-1 h-4 w-4" /> : <ArrowUp className="ml-1 h-4 w-4" />)}
                </Button>
            )
        },
        cell: ({ row }) => {
            const file = row.original
            return <div className="flex items-center gap-3 pl-2">
                {file.contentType == "application/x-directory" ? <Folder className="size-4" fill="var(--foreground)"/> : <File className="size-4" fill="var(--foreground)"/>}
                {file.name}
            </div>
        }
    },
    {
        id: "contentType",
        accessorKey: "contentType",
        header: "Type",
        cell: ({ getValue }) => {
            return <span className="text-muted-foreground">{mimeToReadable(getValue() as string)}</span>
        }
    },
    {
        id: "dateModified",
        accessorKey: "dateModified",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date Modified
                    {column.getIsSorted() && (column.getIsSorted() === "desc" ?  <ArrowDown className="ml-1 h-4 w-4" /> : <ArrowUp className="ml-1 h-4 w-4" />)}
                </Button>
            )
        },
        cell: ({ getValue }) => {
            return <span className="text-muted-foreground">{(getValue() as Date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        },
        meta: {
            style: { textAlign: "left" }
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return <FileRowActions file={row.original} />
        },
        // Add this to make the cell right-aligned
        meta: {
            style: { textAlign: "right" }
        }
    }
]

export type FileBrowserItem =  FileSelect & {
    key: string,
}