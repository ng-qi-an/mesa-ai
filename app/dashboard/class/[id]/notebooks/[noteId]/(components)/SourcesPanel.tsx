'use client';
import FileSelectorDialog from "@/components/file-browser/dialogs/FileSelectorDialog";
import { useNotebook } from "@/components/providers/notebook-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import addUserFileClient from "@/lib/r2actions/addUserFileClient";
import deleteUserFiles from "@/lib/r2actions/deleteUserFiles";
import AddUserFile from "@/lib/r2actions/getAddUserFileURL";
import getUserFiles from "@/lib/r2actions/getUserFiles";
import { allowedMimeTypes } from "@/lib/utils";
import { ChevronDown, File, FileText, MoreVertical, Pen, Plus, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { addNotebookFiles } from "../(actions)/addNotebookFiles";
import { deleteNotebookFile } from "../(actions)/deleteNotebookFile";
import { toast } from "sonner";

export default function SourcesPanel(){
    const [showFileSelector, setShowFileSelector] = useState(false);
    const noteCtx = useNotebook();
    const isCollapsed = noteCtx?.collapsedSources;

    return <Card size="sm" className={`${isCollapsed ? "h-max" : noteCtx?.collapsedTools ? "h-full max-h-full" : "shrink-0  h-full max-h-[230px]"} rounded-md ring-neutral-900 overflow-hidden ${isCollapsed && "gap-0!"}`}>
            <FileSelectorDialog open={showFileSelector} setOpen={setShowFileSelector} onConfirm={async(files) => {
                const finalFiles = files.filter((file)=> noteCtx.files.every((f) => f.id !== file.id))
                noteCtx.setFiles((x) => [...x, ...finalFiles]);
                await addNotebookFiles(noteCtx.noteId, finalFiles.map(f=>f.id));
                setShowFileSelector(false);
                
            }}/>
            <CardHeader className="items-center group flex cursor-pointer relative">
                <motion.div
                    animate={{ rotate: !isCollapsed ? 0 : -90 }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                >
                    <ChevronDown className="text-muted-foreground group-hover:text-foreground size-4"/>
                </motion.div>
                <CardTitle 
                onClick={()=> {
                    if (noteCtx?.collapsedSources){
                        noteCtx?.setCollapsedSources(false);
                    } else {
                        noteCtx?.setCollapsedSources(true);
                        if (noteCtx?.collapsedTools){
                            noteCtx?.setCollapsedTools(false);
                        }
                    }
                }} 
                className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                    Sources
                </CardTitle>
                <Tooltip open={noteCtx?.isGenerating ? undefined : false}>
                    <TooltipTrigger asChild>
                        <span className="inline-block w-fit absolute right-4">
                            <Button disabled={noteCtx?.isGenerating} size={'icon-sm'} className="text-muted-foreground" onClick={(e) => setShowFileSelector(true)} variant={'ghost'}>
                                <Plus/>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                        <p>Sources can't be added while generating.</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <motion.div 
                className="grid"
                initial={false}
                animate={{ gridTemplateRows: isCollapsed ? "0fr" : "1fr", opacity: isCollapsed ? 0 : 1 }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            >
                <div className="overflow-hidden">
                    <div className={`gap-3 flex flex-col px-2 pb-2 h-full overflow-y-auto`}>
                        {!isCollapsed && <Separator className="mb-2" />}
                        {false ? [...Array(3)].map((_, index) => (
                            <Skeleton key={index} className="h-10 w-full"/>
                        ))
                        : noteCtx!.files.length > 0 ? noteCtx!.files.map((file, index) => (
                            <div key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-2 py-1 rounded-md">
                                <FileText className="text-muted-foreground size-5.5"/>
                                <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                                    {file.name}
                                </p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button disabled={noteCtx?.isGenerating} size={'icon-sm'} className="text-muted-foreground" variant={'ghost'}>
                                            <MoreVertical/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="bottom" align="end" className="w-max">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>
                                            <Pen/> Rename source
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={async()=>{
                                            try {
                                                await deleteNotebookFile(noteCtx.noteId, file.id);
                                                noteCtx!.setFiles((x) => x.filter((f) => f.name !== file.name));
                                            } catch (e) {
                                                console.log("Failed to delete file from notebook:", e);
                                                toast.error("Failed to delete file from notebook. Please try again.")
                                            }
                                        }} variant="destructive">
                                            <Trash2/> Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )) : <Empty className="py-0">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <File className="text-muted-foreground" />
                                    </EmptyMedia>
                                    <EmptyTitle className="text-foreground/90">No sources</EmptyTitle>
                                    <EmptyDescription>Add PDFs, documents or even YouTube videos using the plus icon.</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        }
                    </div>
                </div>
            </motion.div>
        </Card>
}