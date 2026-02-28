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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { FileBrowserItem } from "./FileBrowserColumns"

export interface FileBrowserTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export interface FileBrowserTableMiscProps<TData, TValue> {
  onItemSelect: (item: TData) => void
  onSecondaryItemSelect?: (item: TData) => void,
  selected?: string[],
  className?: string
}

export function FileBrowserTable<TData, TValue>({
  columns,
  data,
  onItemSelect,
  onSecondaryItemSelect,
  selected,
  className
}: FileBrowserTableProps<TData, TValue> & FileBrowserTableMiscProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'name',
    desc: false
  }])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
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
                className="cursor-pointer"
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

