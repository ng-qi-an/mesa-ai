import { useClass } from "@/components/providers/class-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import deleteUserFolder from "@/lib/r2actions/folders/deleteUserFolder"
import { FileSelect } from "@/lib/schemas/schema"
import { MoreHorizontal } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { DeleteFileFolderDialog } from "./dialogs/DeleteFileFolderDialog"
import RenameFileFolderDialog from "./dialogs/RenameFileFolderDialog"
import MoveFileFolderDialog from "./dialogs/MoveFileFolderDialog"
import { Badge } from "../ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { ragFile } from "@/lib/rag-actions/ragFile"
import { toast } from "sonner"
import { useFileBrowser } from "../providers/file-browser-provider"
import { useFileProcessing } from "@/lib/r2actions/files/useFileProcessing"
import { Spinner } from "../ui/spinner"

export default function FileRowActions({file}: {file: FileSelect}) {
    const pathname = usePathname()
    const [count, setCount] = useState(0);
    const [openDelete, setOpenDelete] = useState(false);
    const [openRename, setOpenRename] = useState(false);
    const [openMove, setOpenMove] = useState(false);
    const { revalidateData } = useFileBrowser();
    const { status, start } = useFileProcessing(file.id, file.status, file.contentType, async (newStatus) => {
        if (newStatus === "processed") {
            await revalidateData(pathname);
        } else if (newStatus === "error") {
            toast.error("An error occurred while processing the file. Please try again.");
            await revalidateData(pathname);
        }
    })
    useEffect(()=>{
        if (file.status == "uploaded"){
            console.log("File is uploaded but not processed. Starting processing for file:", file.id);
            start();
        }
    }, [])
    return <>
    <div className="flex items-center">
        {status != "processed" && file.contentType != "application/x-directory" && (status == "uploaded" ? 
            <Tooltip>
                <TooltipContent>
                    <p>This file can&apos;t be used yet. Click the dots to begin indexing. May take a few minutes.</p>
                </TooltipContent>
                <TooltipTrigger asChild>
                    <span className="ml-auto">
                            <Badge variant="destructive" className="">Not indexed</Badge>
                    </span>
                </TooltipTrigger>
            </Tooltip>
        : status == "error" ?
            <Tooltip>
                <TooltipContent>
                    <p>An error occurred while indexing this file. Click the dots to try indexing again.</p>
                </TooltipContent>
                <TooltipTrigger asChild>
                    <span className="ml-auto">
                            <Badge variant="destructive" className="">Indexing failed</Badge>
                    </span>
                </TooltipTrigger>
            </Tooltip>
        :
            <Tooltip>
                <TooltipContent>
                    <p>{status == "extracting" ? "Extracting file content..." : status == "chunking" ? "Chunking file content..." : status == "embedding" ? "Embedding file content..." : status == "summarizing" ? "Generating file summary..." : "Processing file: "+status+"..."}</p>
                </TooltipContent>
                <TooltipTrigger asChild>
                    <span className="ml-auto">
                        <Badge variant="secondary">Processing <Spinner className="size-3" /></Badge>
                    </span>
                </TooltipTrigger>
            </Tooltip>
        )}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={`h-8 w-8 p-0 block ml-2 ${(status == "processed" || file.contentType == "application/x-directory") ? "ml-auto" : ""}`}
                >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 ml-1.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {file.contentType != "application/x-directory" && (status == "uploaded" || status == "error") && <>
                    <DropdownMenuItem onClick={()=>{
                        start();
                    }}>Retry index</DropdownMenuItem>
                    <DropdownMenuSeparator/>
                </>}
                <DropdownMenuItem onClick={()=>{
                    setOpenRename(true);
                }}>Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={()=>{
                    setOpenMove(true);
                }}>Move</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={async(e)=>{
                    e.stopPropagation();
                    if (file.contentType == "application/x-directory"){
                        const c = await deleteUserFolder(file.id, false)
                        if (c){
                            setCount(Object.keys(c).length);
                        }
                    }
                    setOpenDelete(true);
                }}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
    <RenameFileFolderDialog isFolder={file.contentType == "application/x-directory"} originalName={file.name} itemId={file.id} open={openRename} setOpen={setOpenRename}/>
    <MoveFileFolderDialog isFolder={file.contentType == "application/x-directory"} itemId={file.id} itemName={file.name} open={openMove} setOpen={setOpenMove}/>
    <DeleteFileFolderDialog isFolder={file.contentType == "application/x-directory"} count={file.contentType == "application/x-directory" ? count : undefined} parent={file.contentType != "application/x-directory" ? (file.parentId || "") : undefined} itemId={file.id} open={openDelete} onOpenChange={setOpenDelete}/>
    </>
}