'use client';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QuizSelect } from "@/lib/schemas/schema";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import RenameQuizDialog from "./dialogs/renameQuizDialog";
import { DeletequizDialog } from "./dialogs/deleteQuizDialog";

export default function QuizActionsDropdown({quiz, triggerClassName, onRename, onDelete}:{quiz: QuizSelect, triggerClassName?: string, onRename: (newName: string) => void, onDelete: () => void}) {
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    return <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} className="ml-auto h-full flex items-center justify-center">
    <Tooltip>
        <DropdownMenu>
            <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                    <span className={triggerClassName}>
                        <Button size={'icon-sm'} onClick={(e)=> e.stopPropagation()} className={cn("text-muted-foreground")} variant={'ghost'}>
                            <MoreVertical/>
                        </Button>
                    </span>
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
    <RenameQuizDialog open={showRenameDialog} setOpen={setShowRenameDialog} quizId={quiz.id} initialName={quiz.name} onSubmit={onRename}/>
    <DeletequizDialog quizId={quiz.id} open={showDeleteDialog} onOpenChange={setShowDeleteDialog} onSubmit={onDelete}/>
</div>
}