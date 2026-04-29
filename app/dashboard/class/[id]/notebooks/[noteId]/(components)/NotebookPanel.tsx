'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TypographyLead } from "@/components/ui/typography/lead";
import { ArrowUp, CircleAlert, Moon, Notebook, RefreshCw, Settings2, Sidebar, Sparkles, StopCircle, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createMathPlugin } from '@streamdown/math';
//@ts-ignore
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { slugify } from "./SectionsPanel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Badge } from "@/components/ui/badge";
import { useNotebook } from "@/components/providers/notebook-provider";
import { useGenerateNotes } from "../(actions)/generateNotes";
import NoteSettingsDialog from "./(modals)/NoteSettingsDialog";
import { Streamdown } from "streamdown";
import { useTheme } from "next-themes";
import checkFileStoreMatch from "../(actions)/checkFileStoreMatch";
import { useNextStep } from "nextstepjs";
import { useIsMobile } from "@/hooks/use-mobile";

const math = createMathPlugin({
  singleDollarTextMath: true,
});

export default function NotebookPanel(){
    const noteCtx = useNotebook()
    const { generateNotes } = useGenerateNotes();
    const { resolvedTheme } = useTheme();
    const contentRef = useRef<HTMLDivElement>(null);
    const [showNoteSettings, setShowNoteSettings] =  useState(false);
    const [followup, setFollowup] = useState("");
    const [forceLightNotebook, setForceLightNotebook] = useState(false);
    const {currentTour, setCurrentStep} = useNextStep();
    const isMobile = useIsMobile();
    useEffect(() => {
        try {
            const savedPreference = localStorage.getItem("notebook-force-light");
            setForceLightNotebook(savedPreference === "1");
        } catch {
            // Ignore localStorage issues.
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("notebook-force-light", forceLightNotebook ? "1" : "0");
        } catch {
            // Ignore localStorage issues.
        }
    }, [forceLightNotebook]);

    const useLightNotebookTheme = resolvedTheme === "dark" && forceLightNotebook;

    // Track which heading is visible using IntersectionObserver
    useEffect(() => {
        if (noteCtx?.notesHistory.length! <= 1 || !contentRef.current) return;
        const headings = contentRef.current.querySelectorAll('h2[id], h1[id]');
        if (headings.length === 0) return;

        const observerCallback: IntersectionObserverCallback = (entries) => {
            // Find the first heading that is intersecting
            const visibleEntries = entries.filter(entry => entry.isIntersecting);
            if (visibleEntries.length > 0) {
                // Sort by their position in the document and pick the topmost
                const sorted = visibleEntries.sort((a, b) => {
                    return a.boundingClientRect.top - b.boundingClientRect.top;
                });
                const topHeading = sorted[0].target as HTMLElement;
                noteCtx?.setActiveSection(topHeading.id);
            }
        };

        const observer = new IntersectionObserver(observerCallback, {
            root: contentRef.current.parentElement,
            rootMargin: '-10% 0px -70% 0px',
            threshold: 0,
        });

        headings.forEach(heading => observer.observe(heading));

        return () => observer.disconnect();
    }, [noteCtx?.notesHistory])
    return  noteCtx && <motion.div layout transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} className="flex-1 min-w-0 h-full">
        <NoteSettingsDialog open={showNoteSettings} onOpenChange={setShowNoteSettings}/>
        <Card
            size="sm"
            id="notebookPanel"
            className={`rounded-md ring-neutral-200 dark:ring-neutral-900 h-full ${
                useLightNotebookTheme
                    ? "dark:[--background:oklch(1_0_0)] dark:[--foreground:oklch(0.145_0_0)] dark:[--card:oklch(1_0_0)] dark:[--card-foreground:oklch(0.145_0_0)] dark:[--popover:oklch(1_0_0)] dark:[--popover-foreground:oklch(0.145_0_0)] dark:[--secondary:oklch(0.97_0_0)] dark:[--secondary-foreground:oklch(0.205_0_0)] dark:[--muted:oklch(0.97_0_0)] dark:[--muted-foreground:oklch(0.556_0_0)] dark:[--accent:oklch(0.97_0_0)] dark:[--accent-foreground:oklch(0.205_0_0)] dark:[--border:oklch(0.922_0_0)] dark:[--input:oklch(0.922_0_0)] dark:[--ring:oklch(0.708_0_0)]"
                    : ""
            }`}
        >
            <CardHeader className="items-center flex relative">
                <CardTitle className="text-muted-foreground">
                    Notebook
                </CardTitle>
                {(noteCtx.isStoringFiles || noteCtx.isMetaLoading || noteCtx.isNotesLoading || noteCtx.isEmbeddingImages) ? 
                <Shimmer duration={3} className="text-sm ml-auto mr-29">
                    {noteCtx?.isStoringFiles ? 
                        "Extracting content.."
                    : noteCtx?.isMetaLoading ?
                        "Generating topics..."
                    : noteCtx?.isNotesLoading ?
                        "Writing notes..."
                    : noteCtx?.isEmbeddingImages ?
                        "Embedding images..."
                    : ""
                    }
                </Shimmer>
                : noteCtx.sourceFiles.length > 0 &&  !checkFileStoreMatch(noteCtx.sourceFiles, noteCtx.files.map(f=> f.id)) && 
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="destructive" className="cursor-default ml-auto mr-28">
                            <CircleAlert data-icon="inline-start" />
                            Outdated
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>"Sync sources" to update the notebook with latest sources.</p>
                    </TooltipContent>
                </Tooltip>}
                
                <Tooltip open={(noteCtx.notesHistory.length === 0 || noteCtx?.isGenerating) ? undefined : false}>
                    <TooltipTrigger asChild>
                        <span className="inline-block w-fit absolute right-22">
                            <Button disabled={noteCtx.notesHistory.length === 0 || noteCtx?.isGenerating} onClick={()=> {
                                setShowNoteSettings(true);
                            }} size={'icon-sm'} className="text-muted-foreground" variant={'ghost'}>
                                {noteCtx?.isGenerating ? <Spinner/> : <Settings2/>}
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                        <p>Note settings can't be changed {noteCtx?.isGenerating ? 'while generating' : 'before generating notes'}.</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="absolute right-13 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground select-none">
                                <Button onClick={()=> setForceLightNotebook(!forceLightNotebook)} disabled={resolvedTheme !== "dark"} variant={"ghost"} size={"icon-sm"}>{forceLightNotebook && resolvedTheme === "dark" ? <Moon/> : <Sun/>}</Button>
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                        <p>{resolvedTheme === "dark" ? "Force light colors in notebook." : "Available only while dark mode is active."}</p>
                    </TooltipContent>
                </Tooltip>
                {!isMobile && <Button onClick={()=> noteCtx?.setCollapsedRightSidebar(!noteCtx.collapsedRightSidebar)} size={'icon-sm'} className="absolute right-4 text-muted-foreground" variant={'ghost'}>
                    <Sidebar/>
                </Button>}
            </CardHeader>
            <div className="h-full gap-2 flex flex-col px-2 w-full overflow-y-auto relative">
                <Separator className="mb-2 w-full"/>
                {(noteCtx?.notesHistory.length! > 0 && noteCtx?.notesStatus != "submitted" && !noteCtx?.isStoringFiles) ? 
                <AnimatePresence>
                    <div ref={contentRef} className={`h-full overflow-auto pb-4 pt-4 prose ${useLightNotebookTheme ? "" : "dark:prose-invert"} min-w-full px-8 pb-16`}>
                        <h1 id={slugify(noteCtx?.metaObject?.header || "")}>{noteCtx?.metaObject?.header}</h1>
                        <TypographyLead>{noteCtx?.metaObject?.subtitle}</TypographyLead>
                        <Separator className="mb-8"/>
                        <Streamdown plugins={{math}} isAnimating={noteCtx.isContentGenerating} animated={{animation: "fadeIn"}} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                            {noteCtx?.getActualNotes(noteCtx.notesHistory)}
                        </Streamdown>
                    </div>
                </AnimatePresence>
                : <div className="relative h-full overflow-hidden">
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
                </div>
                }
                <AnimatePresence mode="wait">
                    <motion.div key={noteCtx?.isContentGenerating ? 'stopGeneratingButton' : 'generateButton'} initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}} className="absolute bottom-2 z-10 left-0 w-full flex px-4 justify-center">
                        {noteCtx?.isGenerating ? (noteCtx?.isContentGenerating ?
                            <Button variant={'secondaryRaised'} size={'lg'} className="px-4" onClick={() => noteCtx?.stopGeneration()}>
                                <StopCircle/>
                                Stop generating
                            </Button>
                        : <></>)
                        : (noteCtx.sourceFiles.length > 0 && !checkFileStoreMatch(noteCtx.sourceFiles, noteCtx.files.map(f=> f.id))) ?
                            <Button variant={'raised'} disabled={noteCtx!.files.length < 1} size={'lg'} className="px-4" onClick={() => {
                                noteCtx?.setShowGenerateNotesDialog(true);
                            }}>
                                <RefreshCw/>
                                Sync sources
                            </Button>
                        : (noteCtx?.notesHistory && noteCtx.notesHistory.length) ?
                            <form onSubmit={async(e)=>{
                                e.preventDefault();
                                if (!followup.trim()) return;
                                const followupInstructions = `Apply only the requested changes to the current notes. Keep all unrelated content as-is unless absolutely necessary for consistency.\n\nRequested changes:\n${followup.trim()}`;
                                await generateNotes({ instructions: followupInstructions, includeContext: false });
                                setFollowup("");
                            }} className="w-full max-w-[400px] relative flex items-center">
                                <Input value={followup} onChange={(e) => setFollowup(e.target.value)} className="bg-secondary/85 dark:bg-secondary/85 backdrop-blur-md rounded-lg text-lg h-12 px-6 pr-12" placeholder="Type a follow up to modify content" />
                                <Button disabled={!followup.trim()} size={'icon-sm'} className="absolute right-1.5 rounded-lg">
                                    <ArrowUp/>
                                </Button>
                            </form>
                        : (!noteCtx?.metaObject || !noteCtx.metaObject.header || !noteCtx.isGenerating && noteCtx.notesHistory.length === 0) && <Button variant={'raised'} disabled={noteCtx!.files.length < 1} size={'lg'} className="px-4" onClick={() => {
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
        </Card>
    </motion.div>
}