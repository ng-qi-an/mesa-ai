"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { checkboxColumn, FileBrowserItem } from "./FileBrowserColumns"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"
import { FileSearchCorner } from "lucide-react"

export interface FileBrowserTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export interface FileBrowserTableMiscProps<TData, TValue> {
  onItemSelect: (item: TData) => void
  onSecondaryItemSelect?: (item: TData) => void,
  selected?: string[],
  setSelected? : (selected: string[]) => void,
  enableCheckbox?: boolean,
  className?: string
}

export function FileBrowserTable<TData, TValue>({
  columns,
  data,
  onItemSelect,
  onSecondaryItemSelect,
  selected,
  setSelected,
  enableCheckbox,
  className
}: FileBrowserTableProps<TData, TValue> & FileBrowserTableMiscProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'name',
    desc: false
  }])
  const finalColumns = enableCheckbox ? [checkboxColumn as ColumnDef<TData, TValue>, ...columns] : columns;
  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    meta: {
      onItemSelect,
      selected,
      setSelected
    },
    state: {
      sorting,
      rowSelection,
    },
  })

  return (
    <div className={cn("overflow-hidden rounded-md border overflow-y-auto max-h-full", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={(row.original as FileBrowserItem).status === "processed" ? "cursor-pointer" : "cursor-default"}
                // onClick={()=> row.toggleSelected()}
                // data-state={row.getIsSelected() && "selected"}
                data-state={selected?.includes((row.original as FileBrowserItem).id) ? "selected" : undefined}
                onClick={(e)=>{
                  if (!(e.target as HTMLDivElement).classList.contains("triggerPrimary") && !e.currentTarget.contains(e.target as Node)) {
                    return;
                  }
                  onItemSelect(row.original)
                }}
                onDoubleClick={(e)=>{
                  if (onSecondaryItemSelect){
                    if (!(e.target as HTMLDivElement).classList.contains("triggerSecondary") && !e.currentTarget.contains(e.target as Node)) {
                      return;
                    }
                    onSecondaryItemSelect(row.original)
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant={"icon"}>
                      <FileSearchCorner/>
                    </EmptyMedia>
                    <EmptyTitle>Nothing here yet...</EmptyTitle>
                    <EmptyDescription>Add a file or folder using the "Create new" button.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

