'use client';
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TypographyLead } from "@/components/ui/typography/lead";
import { Notebook, Sparkles, StopCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { slugify } from "../SectionsPanel";
import { useNotebook } from "@/components/providers/notebook-provider";
import { useTheme } from "next-themes";
import { useNextStep } from "nextstepjs";
// Blocknote
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

// Tiptap
import 'katex/dist/katex.min.css'
import saveNotebookBlocks from "@/lib/actions/notebook/saveNotebookBlocks";
import { migrateDollarMathToInlineMath } from "./mathExtensionUtils";
import {AIExtension} from "@blocknote/xl-ai";
import CustomFormattingToolbar from "@/components/editor/CustomFormattingToolbar";
import { FormattingToolbarController, LinkToolbarController } from "@blocknote/react";
import CustomLinkToolbar from "@/components/editor/CustomLinkToolbar";
import BottomActionToolbar from "@/components/editor/BottomActionToolbar";
import NewNotebookDialog from "../(modals)/NewNotebookModal";

export default function NotebookPanel(){
    const noteCtx = useNotebook()
    const editor = noteCtx.editor;
    const { resolvedTheme } = useTheme();
    const contentRef = useRef<HTMLDivElement>(null);
    const [forceLightNotebook, setForceLightNotebook] = useState(false);
    const {currentTour, setCurrentStep} = useNextStep();
    const [showOutdatedSources, setShowOutdatedSources] = useState(false);
    const [savingInterval, setSavingInterval] = useState<any>(null);
    const [savingBlocks, setSavingBlocks] = useState(false);
    const [editorMode, setEditorMode] = useState<"editing" | "commenting" | "viewing">("editing");
    
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
        if (!noteCtx.notesObject || !contentRef.current || !editor) return;
        try {
            const markdown = noteCtx.notesObject.notes;
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
    }, [noteCtx.notesObject, editor])
    
    // useEffect(()=>{
    //     if (noteCtx.isMetaLoading && editor){
    //         console.log("Loading meta and resetting editor")
    //         try {
    //             editor.replaceBlocks(editor.document, []);
    //         } catch (error) {
    //             console.error("Error occurred while resetting editor:", error);
    //         }
    //     }
    // }, [noteCtx.isMetaLoading, editor])
    return  noteCtx && <> 
        <NewNotebookDialog/>
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
            <div ref={contentRef} className={`h-full overflow-auto pb-4 pt-4  ${useLightNotebookTheme ? "light" : "dark"} min-w-full`}>
                <BlockNoteView
                    theme={useLightNotebookTheme ? "light" : "dark"}
                    className={useLightNotebookTheme ? "light" : "dark"}
                    autoFocus
                    editor={editor}
                    editable={!noteCtx.isGenerating && !noteCtx.isEmbeddingImages && editorMode === "editing"}
                    shadCNComponents={{
                        // Pass modified ShadCN components from your project here.
                        // Otherwise, the default ShadCN components will be used.
                    }}
                    formattingToolbar={false}
                    linkToolbar={false}
                >
                    <FormattingToolbarController formattingToolbar={CustomFormattingToolbar}/>
                    <LinkToolbarController linkToolbar={CustomLinkToolbar}/>
                </BlockNoteView>
                <BottomActionToolbar editor={editor} savingBlocks={savingBlocks} forceLightNotebook={forceLightNotebook} setForceLightNotebook={setForceLightNotebook} editorMode={editorMode} setEditorMode={setEditorMode}/>
            </div>
            {/* DISABLED FOR NOW. The glow effect needs to be much more optimised for a simple animation. Perhaps a video is better. */}
            {/* <AnimatePresence>
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
            </AnimatePresence> */}
            {/* {(noteCtx.notesStatus == "streaming") && <>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary/50 via-primary/0 to-primary/0 animate-movingGradient z-[70] items-end pb-18 flex justify-center pointer-events-none">
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-card to-card/0 animate-movingGradient z-[60] items-end pb-6 flex justify-center pointer-events-none">
            </div>
            </>} */}
            {(noteCtx.notesStatus == "submitted" || noteCtx.showNotebookCreate) && <div className="h-full overflow-hidden absolute top-0 left-0 w-full bg-card z-[50]">
                <Empty className="h-full absolute z-10 top-0 left-0 w-full bg-card/80">
                    {noteCtx?.isStoringFiles ?
                        <EmptyHeader className="">
                            <Spinner className="text-muted-foreground size-6" />
                            <EmptyTitle className="text-foreground/90 mt-2">Uploading files..</EmptyTitle>
                            <EmptyDescription>Extracting text and images...</EmptyDescription>
                        </EmptyHeader>
                    : noteCtx.notesStatus == "submitted" ?
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
                            <EmptyDescription>Interact with the create new dialog.</EmptyDescription>
                        </EmptyHeader>
                    }
                </Empty>
            </div>}
            <AnimatePresence mode="wait">
                <motion.div key={noteCtx?.isContentGenerating ? 'stopGeneratingButton' : 'generateButton'} initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}} className="absolute bottom-2 left-0 w-full flex px-4 justify-center z-[80] pb-4">
                    {noteCtx?.isGenerating && (noteCtx?.isContentGenerating ?
                        <Button variant={noteCtx.isContentGenerating ? 'raised' : "secondaryRaised"} size="lg" className="px-4" onClick={() => noteCtx.notesStop()}>
                            <StopCircle/>
                            Stop generating
                        </Button>
                    : <></>)
                    }
                </motion.div>
            </AnimatePresence>
        </div>
    </>
}
