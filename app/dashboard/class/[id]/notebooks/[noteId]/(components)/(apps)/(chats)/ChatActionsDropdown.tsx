'use client';

import { DeleteChatDialog } from "@/components/chat/dialogs/deleteChatDialog";
import RenameChatDialog from "@/components/chat/dialogs/renameChatDialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChatSelect } from "@/lib/schemas/schema";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useState } from "react";

export default function ChatActionsDropdown({chat, triggerClassName, disabled, onRename, onDelete}:{chat?: ChatSelect |null, triggerClassName?: string, disabled?: boolean, onRename: (newName: string) => void, onDelete: () => void}) {
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    return <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} className="ml-auto h-full flex items-center justify-center">
    <Tooltip>
        <DropdownMenu>
            <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                    <Button disabled={disabled} size={'icon-sm'} onClick={(e)=> e.stopPropagation()} className={cn("text-muted-foreground")} variant={'ghost'}>
                        <MoreVertical/>
                    </Button>
                </DropdownMenuTrigger>
            </TooltipTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setShowRenameDialog(true)}}><Pencil/> Rename</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={(e) => {e.stopPropagation(); setShowDeleteDialog(true)}}><Trash/> Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="bottom" align="end">
            <p>More options</p>
        </TooltipContent>
    </Tooltip>
    {chat &&<>
    <RenameChatDialog open={showRenameDialog} setOpen={setShowRenameDialog} chatid={chat.id} initialName={chat.name} onSubmit={onRename}/>
    <DeleteChatDialog chatId={chat.id} open={showDeleteDialog} onOpenChange={setShowDeleteDialog} onSubmit={onDelete}/>
    </>}
</div>
}