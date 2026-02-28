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

export default function FileRowActions({file}: {file: FileSelect}) {
    const {_class} = useClass()
    const pathname = usePathname()
    const [count, setCount] = useState(0);
    const [openDelete, setOpenDelete] = useState(false);
    const [openRename, setOpenRename] = useState(false);
    const [openMove, setOpenMove] = useState(false);
    return <>
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                className={`h-8 w-8 p-0 block ml-auto`}
            >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 ml-1.5" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="triggerPrimary">{file.contentType == "application/x-directory" ? "Open" : "View"}</DropdownMenuItem> 
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
    <RenameFileFolderDialog isFolder={file.contentType == "application/x-directory"} originalName={file.name} itemId={file.id} open={openRename} setOpen={setOpenRename}/>
    <MoveFileFolderDialog isFolder={file.contentType == "application/x-directory"} itemId={file.id} itemName={file.name} open={openMove} setOpen={setOpenMove}/>
    <DeleteFileFolderDialog isFolder={file.contentType == "application/x-directory"} count={file.contentType == "application/x-directory" ? count : undefined} parent={file.contentType != "application/x-directory" ? (file.parentId || "") : undefined} itemId={file.id} open={openDelete} onOpenChange={setOpenDelete}/>
    </>
}