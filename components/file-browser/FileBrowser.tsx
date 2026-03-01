"use client"
import { FileBrowserItem, fileColumns } from "./FileBrowserColumns";
import { FileBrowserTable, FileBrowserTableMiscProps, FileBrowserTableProps } from "./FileBrowserTable"

export default function FileBrowser({files, hideColumns, hideFileTypes, onItemSelect, onSecondaryItemSelect, className, selected, setSelected, enableCheckbox}: {hideColumns?: string[], hideFileTypes?: string[], files: FileBrowserItem[]} &FileBrowserTableMiscProps<FileBrowserItem, any>) {
    if (!onItemSelect){
        throw new Error("onItemSelect is required for FileBrowser")
    }
    return <FileBrowserTable columns={fileColumns.filter((col)=> !hideColumns || (col.id && !hideColumns.includes(col.id)))} data={files.filter(f=>!hideFileTypes || !hideFileTypes.includes(f.contentType))} onItemSelect={onItemSelect} onSecondaryItemSelect={onSecondaryItemSelect} selected={selected} setSelected={setSelected} enableCheckbox={enableCheckbox} className={className}/>
}

