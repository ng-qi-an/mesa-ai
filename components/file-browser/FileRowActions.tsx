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
import { useState } from "react"
import { DeleteFileFolderDialog } from "./dialogs/DeleteFileFolderDialog"
import RenameFileFolderDialog from "./dialogs/RenameFileFolderDialog"
import MoveFileFolderDialog from "./dialogs/MoveFileFolderDialog"
import { Badge } from "../ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { ragFile } from "@/lib/rag-actions/ragFile"
import { toast } from "sonner"
import { useFileBrowser } from "../providers/file-browser-provider"

export default function FileRowActions({file}: {file: FileSelect}) {
    const {_class} = useClass()
    const pathname = usePathname()
    const [count, setCount] = useState(0);
    const [openDelete, setOpenDelete] = useState(false);
    const [openRename, setOpenRename] = useState(false);
    const [openMove, setOpenMove] = useState(false);
    const [indexing, setIndexing] = useState(false);
    const { revalidateData } = useFileBrowser();
    return <>
    <div className="flex items-center">
        {file.status != "processed" && file.contentType != "application/x-directory" && (indexing ? 
            <Badge className="ml-auto" variant="secondary">Indexing...</Badge>
        : 
        <Tooltip>
            <TooltipContent>
                <p>This file can't be used yet. Click the dots to begin indexing. May take a few minutes.</p>
            </TooltipContent>
            <TooltipTrigger asChild>
                <span className="ml-auto">
                        <Badge variant="destructive" className="">Not indexed</Badge>
                </span>
            </TooltipTrigger>
        </Tooltip>)}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={`h-8 w-8 p-0 block ml-2 ${(file.status == "processed" || file.contentType == "application/x-directory") ? "ml-auto" : ""}`}
                >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 ml-1.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {file.contentType != "application/x-directory" && !indexing && file.status != "processed" && <>
                    <DropdownMenuItem onClick={()=>{
                        setIndexing(true);
                        const indexPromise = new Promise<void>(async (resolve, reject) => {
                            try {
                                await ragFile(file.id, file.name);
                                resolve();
                            } catch (error) {
                                reject("Error indexing file:" + error);
                            }
                        });
                        toast.promise(indexPromise, {
                            loading: "Indexing file...",
                            success: async() => {
                                await revalidateData(pathname)
                                return `File indexed successfully`;
                            },
                            error: async (e) => {
                                setIndexing(false);
                                await revalidateData(pathname)
                                return `Error indexing file: ${e}`;
                            },
                        })
                    }}>Start index</DropdownMenuItem>
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