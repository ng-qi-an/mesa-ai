import { BlockNoteEditor } from "@blocknote/core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Cloud, CloudSync, Eye, MessageSquareText, Moon, Pen, Settings2, Sparkle, Sun } from "lucide-react";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useNotebook } from "../providers/notebook-provider";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import checkFileStoreMatch from "@/app/dashboard/class/[id]/notebooks/[noteId]/(actions)/checkFileStoreMatch";
import NoteSettingsDialog from "@/app/dashboard/class/[id]/notebooks/[noteId]/(components)/(modals)/NoteSettingsDialog";
import { useTheme } from "next-themes";
import { Spinner } from "../ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useClass } from "../providers/class-provider";
import { cn } from "@/lib/utils";

export default function BottomActionToolbar({editor, savingBlocks, forceLightNotebook, setForceLightNotebook, editorMode, setEditorMode}: {editor: BlockNoteEditor<any, any, any>, savingBlocks: boolean, forceLightNotebook: boolean, setForceLightNotebook: (force: boolean) => void, editorMode: "editing" | "commenting" | "viewing", setEditorMode: (mode: "editing" | "commenting" | "viewing") => void}) {
    const noteCtx = useNotebook();
    const editorModes = [
        {label: "Editing", value: "editing", description: "Edit the content directly.", icon: Pen},
        {label: "Commenting", value: "commenting", description: "Edits become suggestions.", icon: MessageSquareText},
        {label: "Viewing", value: "viewing", description: "Read the content without editing.", icon: Eye},
    ]
    const [showOutdatedSources, setShowOutdatedSources] = useState(false);
    const [showNoteSettings, setShowNoteSettings] = useState(false);
    const { resolvedTheme } = useTheme();
    const {_class} = useClass();
    useEffect(()=>{
        setShowOutdatedSources(noteCtx.sourceFiles.length > 0 && !checkFileStoreMatch(noteCtx.sourceFiles, noteCtx.files.map(f=> f.id)))
    },[noteCtx.sourceFiles, noteCtx.files])
    editor.isEditable

    return <>
    <NoteSettingsDialog open={showNoteSettings} onOpenChange={setShowNoteSettings}/>
    <AnimatePresence>
        <div className={cn(_class.theme, "flex justify-center absolute z-20 bottom-2 left-0 w-full px-2")}>
            {!noteCtx.isGenerating && <motion.div initial={{y: 50, scale: 0.9, opacity: 0}} animate={{y: 0, scale: 1, opacity: 1}} exit={{y: 50, scale: 0.9, opacity: 0}} className="bg-card/80 backdrop-blur-lg rounded-lg border p-1 px-2 w-max max-w-[600px] flex items-center gap-2">
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-block w-fit">
                            <Button disabled={noteCtx?.isGenerating || noteCtx?.isEmbeddingImages} onClick={()=> {
                                noteCtx?.setShowGenerateNotesDialog(true);
                            }} size={'icon-sm'} className={`text-muted-foreground ${showOutdatedSources ? 'text-primary hover:text-primary' : ''}`} variant={'ghost'}>
                                <Sparkle/>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Generate new notes</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-block w-fit">
                            <Button disabled={noteCtx.blocks.length === 0 || noteCtx?.isGenerating} onClick={()=> {
                                setShowNoteSettings(true);
                            }} size={'icon-sm'} className="text-muted-foreground" variant={'ghost'}>
                                <Settings2/>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {noteCtx.isGenerating ? "Can't edit while generating" : "Customize content"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button size={'icon-sm'} className={`${savingBlocks ? "text-muted-foreground" : "text-muted-foreground"}`} variant={'ghost'}>
                                        {savingBlocks ? <CloudSync/> : <Cloud/>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="top" sideOffset={10}>
                                    <p className="text-sm text-muted-foreground">{savingBlocks ? "Saving blocks..." : "All changes saved"}</p>
                                </PopoverContent>
                            </Popover>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {savingBlocks ? "Saving..." : "All changes saved"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground select-none">
                                <Button onClick={()=> setForceLightNotebook(!forceLightNotebook)} disabled={resolvedTheme !== "dark"} variant={"ghost"} size={"icon-sm"}>{forceLightNotebook && resolvedTheme === "dark" ? <Moon/> : <Sun/>}</Button>
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>{resolvedTheme === "dark" ? "Force light colors in notebook." : "Available only while dark mode is active."}</p>
                    </TooltipContent>
                </Tooltip>
                <Select defaultValue={editorMode} onValueChange={(value)=>{
                    setEditorMode(value as "editing" | "commenting" | "viewing");
                }}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SelectTrigger className="bg-transparent! group hover:bg-secondary! border-transparent text-muted-foreground w-max p-2" size="sm" >
                                <SelectValue placeholder="Editor mode"/>
                            </SelectTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Switch editor mode</p>
                        </TooltipContent>
                    </Tooltip>
                    <SelectContent>
                        {editorModes.map((mode, index) => {
                            return <SelectItem key={index} value={mode.value} className="pl-3">
                                <mode.icon className="size-4"/>
                                <div className="flex flex-col block">
                                    <span className="ml-1 group-data-[slot=tooltip-trigger]:hidden">{mode.label}</span>
                                    <span className="ml-1 group-data-[slot=tooltip-trigger]:hidden text-xs text-muted-foreground">{mode.description}</span>     
                                </div>
                           </SelectItem>
                        })}
                    </SelectContent>
                </Select>
            </motion.div>}
        </div>
    </AnimatePresence>
    </>
}