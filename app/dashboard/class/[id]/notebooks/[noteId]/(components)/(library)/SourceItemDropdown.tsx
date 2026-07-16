import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Trash2, X } from "lucide-react";
import { deleteNotebookFile } from "../../(actions)/deleteNotebookFile";
import { useNotebook } from "@/components/providers/notebook-provider";
import deleteUserFile from "@/lib/r2actions/files/deleteUserFile";

export default function SourceItemDropdown({id, noteId, children}: {id: string, noteId: string, children: React.ReactNode}){
    const { setFiles } = useNotebook();
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={async ()=>{
                await deleteNotebookFile(noteId, id);
                setFiles((x) => x.filter((f) => f.id != id));
            }}><X/> Remove</DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem variant="destructive" onClick={async()=>{
                await deleteNotebookFile(noteId, id);
                setFiles((x) => x.filter((f) => f.id != id));
                await deleteUserFile(id);
            }}><Trash2/> Delete</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
}