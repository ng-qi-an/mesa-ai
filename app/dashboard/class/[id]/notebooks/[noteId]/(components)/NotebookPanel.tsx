'use client';
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TypographyLead } from "@/components/ui/typography/lead";
import { Cloud, CloudSync, Moon, Notebook, Settings2, Sparkle, Sparkles, StopCircle, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { slugify } from "./SectionsPanel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotebook } from "@/components/providers/notebook-provider";
import { useGenerateNotes } from "../(actions)/generateNotes";
import NoteSettingsDialog from "./(modals)/NoteSettingsDialog";
import { useTheme } from "next-themes";
import checkFileStoreMatch from "../(actions)/checkFileStoreMatch";
import { useNextStep } from "nextstepjs";
import { useIsMobile } from "@/hooks/use-mobile";
import SoftAurora from "@/components/SoftAurora";
// Blocknote
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

// Tiptap
import 'katex/dist/katex.min.css'
import saveNotebookBlocks from "@/lib/actions/notebook/saveNotebookBlocks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { migrateDollarMathToInlineMath } from "./(notebook)/mathExtensionUtils";
import {
    AIExtension,
  AIMenuController,
  AIToolbarButton,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import { FormattingToolbar, getDefaultReactSlashMenuItems, getFormattingToolbarItems, SuggestionMenuController } from "@blocknote/react";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";

const FormattingToolbarWithAI = () => (
  <FormattingToolbar>
    {...getFormattingToolbarItems()}
    {/* Add the AI button */}
    <AIToolbarButton />
  </FormattingToolbar>
);

// Slash menu items with the AI option added
const getSlashMenuItemsWithAI = (editor: BlockNoteEditor<any, any, any>) => [
  ...getDefaultReactSlashMenuItems(editor),
  // add the default AI slash menu items, or define your own
  ...getAISlashMenuItems(editor),
];


export default function NotebookPanel(){
    const noteCtx = useNotebook()
    const editor = noteCtx.editor;
    const { generateNotes } = useGenerateNotes();
    const { resolvedTheme } = useTheme();
    const contentRef = useRef<HTMLDivElement>(null);
    const [showNoteSettings, setShowNoteSettings] =  useState(false);
    const [forceLightNotebook, setForceLightNotebook] = useState(false);
    const {currentTour, setCurrentStep} = useNextStep();
    const isMobile = useIsMobile();
    const [showOutdatedSources, setShowOutdatedSources] = useState(false);
    const [savingInterval, setSavingInterval] = useState<any>(null);
    const  [savingBlocks, setSavingBlocks] = useState(false);
    
    useEffect(() => {
        try {
            const savedPreference = localStorage.getItem("notebook-force-light");
            setForceLightNotebook(savedPreference === "1");
        } catch {
            // Ignore localStorage issues.
        }
    }, []);
    useEffect(()=>{
        if (!editor) return;
        if (noteCtx.isGenerating) return;
        const cleanupOnChange = editor.onChange((editor) => {
            const aiMenuState = editor.getExtension(AIExtension)?.store.state.aiMenuState;
            if (aiMenuState !== "closed") {
                setSavingInterval((existingInterval: NodeJS.Timeout | null) => {
                if (existingInterval) {
                    clearTimeout(existingInterval);
                }

                return null;
                });

                setSavingBlocks(false);
                return;
            }
            setSavingBlocks(true);
            if (savingInterval){
                clearTimeout(savingInterval);
            }
            setSavingInterval((oldInterval: NodeJS.Timeout | null) => {
                if (oldInterval){
                    clearTimeout(oldInterval);
                }
                return setTimeout(async()=>{
                    const newBlocks = await saveNotebookBlocks(noteCtx.noteId, {blocks: editor.document});
                    noteCtx.setBlocks(newBlocks.blocks);
                    console.log("Saved successfully!")
                    setSavingBlocks(false);
                }, 1000)
            })
        });
        // const headings = contentRef.current.querySelectorAll('h2[id], h1[id]');
        // if (headings.length === 0) return;
        // const observerCallback: IntersectionObserverCallback = (entries) => {
        //     // Find the first heading that is intersecting
        //     const visibleEntries = entries.filter(entry => entry.isIntersecting);
        //     if (visibleEntries.length > 0) {
        //         // Sort by their position in the document and pick the topmost
        //         const sorted = visibleEntries.sort((a, b) => {
        //             return a.boundingClientRect.top - b.boundingClientRect.top;
        //         });
        //         const topHeading = sorted[0].target as HTMLElement;
        //         noteCtx?.setActiveSection(topHeading.id);
        //     }
        // };

        // const observer = new IntersectionObserver(observerCallback, {
        //     root: contentRef.current.parentElement,
        //     rootMargin: '-10% 0px -70% 0px',
        //     threshold: 0,
        // });

        // headings.forEach(heading => observer.observe(heading));

        // return () => observer.disconnect();
        return ()=>{
            cleanupOnChange();
        }
    }, [editor, noteCtx.isGenerating])
    useEffect(()=>{
        console.log("Editor is event is set");
        console.log("Editor is mounted and ready");
        editor.replaceBlocks(editor.document, noteCtx.blocks);
        console.log("Set initial blocks!")
    }, [editor])

    useEffect(() => {
        try {
            localStorage.setItem("notebook-force-light", forceLightNotebook ? "1" : "0");
        } catch {
            // Ignore localStorage issues.
        }
    }, [forceLightNotebook]);

    const useLightNotebookTheme = resolvedTheme === "light" || (resolvedTheme === "dark" && forceLightNotebook);

    // Track which heading is visible using IntersectionObserver
    useEffect(() => {
        if (noteCtx?.notesHistory.length <= 1 || !contentRef.current || !editor) return;
        try {
            const markdown = noteCtx?.getActualNotes(noteCtx.notesHistory)
            if (!markdown) return;
            console.log("Turning markdown into blocks")
            const blocks = editor.tryParseMarkdownToBlocks(markdown);
            editor.replaceBlocks(editor.document, blocks);
            console.log("Replaced blocks with new markdown")
            migrateDollarMathToInlineMath(editor);
            console.log("Migrated dollar math to inline math")
            noteCtx.setBlocks(editor.document)
        } catch (error) {
            console.error("Error occurred while updating blocks:", error);
        }
    }, [noteCtx?.notesHistory, editor])
    useEffect(()=>{
        setShowOutdatedSources(noteCtx.sourceFiles.length > 0 && !checkFileStoreMatch(noteCtx.sourceFiles, noteCtx.files.map(f=> f.id)))
    },[noteCtx.sourceFiles, noteCtx.files])
    useEffect(()=>{
        if (noteCtx.isMetaLoading && editor){
            console.log("Loading meta and resetting editor")
            try {
                editor.replaceBlocks(editor.document, []);
            } catch (error) {
                console.error("Error occurred while resetting editor:", error);
            }
        }
    }, [noteCtx.isMetaLoading, editor])
    return  noteCtx && <> 
        <NoteSettingsDialog open={showNoteSettings} onOpenChange={setShowNoteSettings}/>
        <div className="h-full gap-2 flex flex-col w-full overflow-hidden relative bg-card">
            { showOutdatedSources && <Card size="sm" className={`absolute right-0 bottom-[-110px] hover:bottom-0 transition-all z-[60] bg-card/90 backdrop-blur-lg rounded-b-none border-b-0 border-l-0 w-[300px]`}>
                <CardHeader>
                    <CardTitle>Outdated sources</CardTitle>
                    <CardDescription>Changes were made to your source list. Click here to learn more.</CardDescription>
                    <CardAction><Button variant="ghost" size="icon-xs" onClick={()=> setShowOutdatedSources(false)}><X /></Button></CardAction>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Press <b className="text-foreground">"Generate"</b> to update with the latest content.</p>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" onClick={()=> setShowOutdatedSources(false)}>
                        Don't show again
                    </Button>
                    <Button className="ml-auto" onClick={()=> noteCtx.setShowGenerateNotesDialog(true)}>
                        Generate
                    </Button>
                </CardFooter>
            </Card>}
            <div className="absolute left-0 bottom-0 bg-card p-1 pb-2 border-t border-r rounded-tr-lg flex flex-col z-[60] items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button size={'icon-sm'} className={`${savingBlocks ? "text-muted-foreground" : "text-muted-foreground"}`} variant={'ghost'}>
                                        {savingBlocks ? <CloudSync/> : <Cloud/>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="right" align="start" sideOffset={10}>
                                    <p className="text-sm text-muted-foreground">{savingBlocks ? "Saving blocks..." : "All changes saved"}</p>
                                </PopoverContent>
                            </Popover>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {savingBlocks ? "Saving..." : "All changes saved"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-block w-fit">
                            <Button disabled={noteCtx?.isGenerating || noteCtx?.isEmbeddingImages} onClick={()=> {
                                noteCtx?.setShowGenerateNotesDialog(true);
                            }} size={'icon-sm'} className={`text-muted-foreground ${showOutdatedSources ? 'text-primary hover:text-primary' : ''}`} variant={'ghost'}>
                                {(noteCtx?.isGenerating || noteCtx?.isEmbeddingImages) ? <Spinner/> : <Sparkle/>}
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="end">
                        <p>{noteCtx?.isMetaLoading ?
                                "Generating topics..."
                            : noteCtx?.isNotesLoading ?
                                "Writing notes..."
                            : noteCtx?.isEmbeddingImages ?
                                "Embedding images..."
                            : showOutdatedSources ?
                                "Generate notes from new sources"
                            : "Regenerate notes"
                            }
                        </p>
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
                    <TooltipContent side="right" align="end">
                        {noteCtx.isGenerating ? "Can't edit while generating" : "Customize content"}
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
                    <TooltipContent side="right" align="end">
                        <p>{resolvedTheme === "dark" ? "Force light colors in notebook." : "Available only while dark mode is active."}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <div ref={contentRef} className={`h-full overflow-auto pb-4 pt-4  ${useLightNotebookTheme ? "light" : "dark"} min-w-full`}>
                <div className="px-10 pt-4 pb-4">
                    <h1 className="text-4xl font-bold mb-6" id={slugify(noteCtx?.metaObject?.header || "")}>{noteCtx?.metaObject?.header}</h1>
                    <TypographyLead>{noteCtx?.metaObject?.subtitle}</TypographyLead>
                    <Separator className="mt-4"/>
                </div>
                <BlockNoteView
                    theme={useLightNotebookTheme ? "light" : "dark"}
                    className={useLightNotebookTheme ? "light" : "dark"}
                    editor={editor}
                    editable={!noteCtx.isGenerating && !noteCtx.isEmbeddingImages}
                    shadCNComponents={{
                        // Pass modified ShadCN components from your project here.
                        // Otherwise, the default ShadCN components will be used.
                    }}
                >
                </BlockNoteView>
            </div>
            <AnimatePresence>
                {(noteCtx.notesStatus == "streaming") && <motion.div initial={{bottom: -400}} animate={{bottom: -200}} exit={{bottom: -400}} className="absolute left-0 z-[70] w-full h-[350px] rounded-b-lg overflow-hidden pointer-events-none">
                    <div className="relative w-full blur-sm h-full overflow-hidden rounded-b-lg">
                        <SoftAurora
                            speed={2.5}
                            scale={1.5}
                            brightness={1.5}
                            noiseFrequency={2}
                            noiseAmplitude={1}
                            bandHeight={0.5}
                            bandSpread={1.2}
                            octaveDecay={0.05}
                            layerOffset={1}
                            colorSpeed={1}
                            enableMouseInteraction={false}
                            mouseInfluence={0.25}
                        />
                    </div>
                </motion.div>}
            </AnimatePresence>
            {/* {(noteCtx.notesStatus == "streaming") && <>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary/50 via-primary/0 to-primary/0 animate-movingGradient z-[70] items-end pb-18 flex justify-center pointer-events-none">
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-card to-card/0 animate-movingGradient z-[60] items-end pb-6 flex justify-center pointer-events-none">
            </div>
            </>} */}
            {(noteCtx.isMetaLoading || noteCtx.notesStatus == "submitted" || noteCtx.blocks.length == 0 || !noteCtx.metaObject?.header) && <div className="h-full overflow-hidden absolute top-0 left-0 w-full bg-card z-[50]">
                {noteCtx?.metaObject && noteCtx.isGenerating && <div className="flex flex-col absolute items-center justify-center top-0 left-0 h-full w-full">
                    <p className="w-[80%] gap-10 text-justify leading-10 overflow-hidden">
                        {noteCtx.metaObject.topics?.filter((topic): topic is string => topic !== undefined).map((topic:string, index:number)=> {
                            return <motion.span layout initial={{opacity: 0}} animate={{opacity: index % 2 == 0 ? 0.15 : 0.3}} key={index} className={`sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-muted-foreground font-bold break-all ${(index % 2 ? "pulse-darker" : "pulse-lighter")} `}> {topic}</motion.span>
                        })}
                    </p>    
                </div>}
                <Empty className="h-full absolute z-10 top-0 left-0 w-full bg-card/80">
                    {noteCtx?.isStoringFiles ?
                        <EmptyHeader className="">
                            <Spinner className="text-muted-foreground size-6" />
                            <EmptyTitle className="text-foreground/90 mt-2">Uploading files..</EmptyTitle>
                            <EmptyDescription>Extracting text and images...</EmptyDescription>
                        </EmptyHeader>
                    : noteCtx?.isMetaLoading ?
                        <EmptyHeader className="">
                            <Spinner className="text-muted-foreground size-6" />
                            <EmptyTitle className="text-foreground/90 mt-2">Generating topics..</EmptyTitle>
                            <EmptyDescription>{(!noteCtx.metaObject || !noteCtx.metaObject.topics) ? "Hang tight while we analyze your sources and come up with relevant topics." : `Generated ${Object.keys(noteCtx.metaObject.topics).length}/${Math.max(8, Object.keys(noteCtx.metaObject.topics).length)} topics`}</EmptyDescription>
                        </EmptyHeader>
                    : noteCtx?.isNotesLoading ?
                        <EmptyHeader>
                            <Spinner className="text-muted-foreground size-6" />
                            <EmptyTitle className="text-foreground/90 mt-2">Writing notes..</EmptyTitle>
                            <EmptyDescription>We're compiling your notes based on the generated topics. This might take a few moments.</EmptyDescription>
                        </EmptyHeader>
                    : <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Notebook className="text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle className="text-foreground/90">No notes yet</EmptyTitle>
                            <EmptyDescription>Press the generate button to create notes using your sources.</EmptyDescription>
                        </EmptyHeader>
                    }
                </Empty>
            </div>}
            <AnimatePresence mode="wait">
                <motion.div key={noteCtx?.isContentGenerating ? 'stopGeneratingButton' : 'generateButton'} initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}} className="absolute bottom-2 left-0 w-full flex px-4 justify-center z-[80] pb-4">
                    
                    {noteCtx?.isGenerating ? (noteCtx?.isContentGenerating ?
                        <Button variant={noteCtx.notesStatus == "streaming" ? 'raised' : "secondaryRaised"} size="lg" className="px-4" onClick={() => noteCtx?.stopGeneration()}>
                            <StopCircle/>
                            Stop generating
                        </Button>
                    : <></>)
                    : (!noteCtx?.metaObject || !noteCtx.metaObject.header || !noteCtx.isGenerating && noteCtx.blocks.length === 0) && <Button variant={'raised'} disabled={noteCtx!.files.length < 1} size={'lg'} className="px-4" onClick={() => {
                        noteCtx?.setShowGenerateNotesDialog(true);
                        if (currentTour == "onboarding"){
                            setCurrentStep(10, 100);
                        }
                    }}>
                        <Sparkles/>
                        Generate notes
                    </Button>
                    }
                </motion.div>
            </AnimatePresence>
        </div>
    </>
}