import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, X } from "lucide-react";
import { deleteNotebookFile } from "../../(actions)/deleteNotebookFile";
import { useNotebook } from "@/components/providers/notebook-provider";
import deleteUserFile from "@/lib/r2actions/files/deleteUserFile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function SourceItemDropdown({id, noteId}: {id: string, noteId: string}){
    const { setFiles } = useNotebook();
    return <Tooltip>
        <TooltipTrigger asChild>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            <MoreVertical/>
                        </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={async ()=>{
                        await deleteNotebookFile(noteId, id);
                        setFiles((x) => x.filter((f) => f.id != id));
                    }}><X/> Remove</DropdownMenuItem>
                    {/* <DropdownMenuSeparator/>
                    <DropdownMenuItem variant="destructive" onClick={async()=>{
                        await deleteNotebookFile(noteId, id);
                        setFiles((x) => x.filter((f) => f.id != id));
                        await deleteUserFile(id);
                    }}><Trash2/> Delete</DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
            <p>More options</p>
        </TooltipContent>
    </Tooltip>
}