'use client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, CloudUpload, FolderPlus, Upload } from "lucide-react";
import { useState } from "react";
import CreateFolderDialog from "./CreateFolderDialog";
import { FileSelect } from "@/lib/schemas/schema";

export default function CreateNewButton({nests}: {nests: FileSelect[]}) {
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    return <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'secondary'} className="ml-auto absolute right-6 z-10">
                    Create new
                    <ChevronDown/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-max" align="end">
                <DropdownMenuItem>
                    <Upload/>
                    Upload file
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CloudUpload/>
                    Google Drive
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={()=> setCreateFolderOpen(true)}>
                    <FolderPlus/>
                    Add folder
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <CreateFolderDialog open={createFolderOpen} setOpen={setCreateFolderOpen} nests={nests}/>
    </>
}