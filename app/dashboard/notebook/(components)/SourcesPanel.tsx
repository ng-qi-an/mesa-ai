'use client';
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NotebookContext } from "@/lib/contexts";
import addUserFileClient from "@/lib/r2actions/addUserFileClient";
import deleteUserFiles from "@/lib/r2actions/deleteUserFiles";
import AddUserFile from "@/lib/r2actions/getAddUserFileURL";
import getUserFiles, { FileListType } from "@/lib/r2actions/getUserFiles";
import { ChevronDown, ChevronRight, File, FileText, MoreVertical, Pen, Plus, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useContext, useEffect, useRef, useState } from "react";

export default function SourcesPanel(){
    const fileInputRef = useRef<HTMLInputElement>(null);
    const noteCtx = useContext(NotebookContext);
    const isCollapsed = noteCtx?.collapsedSources;
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        async function loadSources(){
            if (noteCtx){
                console.log("Loading user files...");
                const response = await getUserFiles();
                console.log(response)
                noteCtx?.setFiles(response);
                setLoading(false);
            }
        }
        loadSources();
    }, [])

    return <Card size="sm" className={`shrink-0 rounded-md ring-neutral-900 overflow-hidden ${isCollapsed && "gap-0!"}`}>
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
                <Input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={async(e)=>{
                    if (e.target.files) {
                        const filesArray = Array.from(e.target.files)
                        console.log("Files uploaded:", filesArray)
                        const urls = await AddUserFile(filesArray.map((file)=> ({ name: file.name, type: file.type })));
                        noteCtx!.setFiles((x)=> [...x.filter((f)=> f.status != "failed")]);
                        const result = await addUserFileClient(filesArray, urls, noteCtx!.setFiles);
                        console.log("File upload result:", result);
                        fileInputRef.current!.value = "";
                    }
                }}
                accept="image/*,.pdf"
                className='absolute right-4 opacity-0 pointer-events-none w-20'
                />
                <Tooltip open={noteCtx?.isGenerating ? undefined : false}>
                    <TooltipTrigger asChild>
                        <span className="inline-block w-fit absolute right-4">
                            <Button disabled={noteCtx?.isGenerating} size={'icon-sm'} className="text-muted-foreground" onClick={(e) => {  fileInputRef.current?.click(); }} variant={'ghost'}>
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
                    <div className={`gap-3 flex flex-col px-2 pb-2 ${(noteCtx?.collapsedTools ? "max-h-full" : "h-[230px]")} overflow-y-auto`}>
                        {!isCollapsed && <Separator className="mb-2" />}
                        {loading ? [...Array(3)].map((_, index) => (
                            <Skeleton key={index} className="h-10 w-full"/>
                        ))
                        : noteCtx!.files.length > 0 ? noteCtx!.files.map((file, index) => (
                            <div key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-2 py-1 rounded-md">
                                <FileText className="text-muted-foreground size-5.5"/>
                                <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                                    {file.name}
                                </p>
                                {file.status == "uploaded" ? <DropdownMenu>
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
                                            const response = await deleteUserFiles([file.name]);
                                            if (response[0].success){
                                                noteCtx!.setFiles((x) => x.filter((f) => f.name !== file.name));
                                            } else {
                                                console.log("Failed to delete file:", response[0].error);
                                            }
                                        }} variant="destructive">
                                            <Trash2/> Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                : file.status == "pending" ? 
                                    <div className="size-8 shrink-0 flex items-center justify-center">
                                        <Spinner className="size-4"/>
                                    </div>
                                : file.status == "failed" && 
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="size-8 shrink-0 flex items-center justify-center text-destructive">
                                                <X className="size-4"/>
                                            </div>
                                            
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" align="end">
                                            <p>Upload failed. Please try uploading the file again.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    
                                }
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