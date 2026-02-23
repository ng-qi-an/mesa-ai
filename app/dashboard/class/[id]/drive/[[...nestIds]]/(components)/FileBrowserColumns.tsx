
import { FileSelect } from "@/lib/schemas/schema"
import { mimeToReadable } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, File, Folder, MoreHorizontal } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import FileRowActions from "./FileRowActions"


export const fileColumns: ColumnDef<FileSelect>[] = [
    {
        id: "select",
        header: ({ table }) => (
        <Checkbox
            checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
        ),
        cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="-ml-3"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    {column.getIsSorted() && (column.getIsSorted() === "asc" ?  <ArrowDown className="ml-1 h-4 w-4" /> : <ArrowUp className="ml-1 h-4 w-4" />)}
                </Button>
            )
        },
        cell: ({ row }) => {
            const file = row.original
            return <div className="flex items-center gap-3">
                {file.contentType == "application/x-directory" ? <Folder className="size-4" fill="var(--foreground)"/> : <File className="size-4" fill="var(--foreground)"/>}
                {file.name}
            </div>
        }
    },
    {
        accessorKey: "contentType",
        header: "Type",
        cell: ({ getValue }) => {
            return <span className="text-muted-foreground">{mimeToReadable(getValue() as string)}</span>
        }
    },
    {
        accessorKey: "dateModified",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date Modified
                    {column.getIsSorted() === "asc" ? (
                        <ArrowDown className="ml-1 h-4 w-4" />
                    ) : (
                        <ArrowUp className="ml-1 h-4 w-4" />
                    )}
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