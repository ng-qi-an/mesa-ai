'use client';
import { noteSchema } from "@/app/api/notebook/schema";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TypographyH1 } from "@/components/ui/typography/h1";
import { TypographyLead } from "@/components/ui/typography/lead";
import { NotebookContext } from "@/lib/contexts";
import { experimental_useObject } from "@ai-sdk/react";
import { ChevronLeft, FileText, List, Minus, MoreVertical, Notebook, RotateCw, Sidebar, SidebarClose, SidebarOpen, Square } from "lucide-react";
import { motion } from "motion/react";
import { useContext, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { slugify } from "./SectionsPanel";

export default function NotebookPanel(){
    const noteCtx = useContext(NotebookContext)
    const contentRef = useRef<HTMLDivElement>(null);
    const { object, submit, isLoading, clear, stop } = experimental_useObject({
        api: '/api/notebook',
        schema: noteSchema,
    });
    useEffect(()=>{
        if (object && object.header && object.subtitle && object.content){
            noteCtx?.setNoteContent({
                header: object.header,
                subtitle: object.subtitle,
                content: object.content,
            })
        }
    }, [object])

    // Track which heading is visible using IntersectionObserver
    useEffect(() => {
        if (!noteCtx?.noteContent || !contentRef.current) return;

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
    }, [noteCtx?.noteContent])
    return <motion.div layout transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} className="flex-1 min-w-0 h-full">
        <Card size="sm" className="rounded-md ring-neutral-900 h-full overflow-hidden">
            <CardHeader className="items-center flex relative">
                <CardTitle className="text-muted-foreground">
                    Notebook
                </CardTitle>
                <Button disabled={isLoading} onClick={()=> {
                    clear()
                    noteCtx?.setNoteContent(null);
                    submit({files: noteCtx?.files.map(f => f.name) || []});
                }} size={'icon-sm'} className="absolute right-24 text-muted-foreground" variant={'ghost'}>
                    {isLoading ? <Spinner/> : <RotateCw/>}
                </Button>
                <Button disabled={!isLoading} onClick={()=> {
                    stop();
                }} size={'icon-sm'} className="absolute right-14 text-muted-foreground" variant={'ghost'}>
                    <Square/>
                </Button>
                <Button onClick={()=> noteCtx?.setCollapsedRightSidebar(!noteCtx.collapsedRightSidebar)} size={'icon-sm'} className="absolute right-4 text-muted-foreground" variant={'ghost'}>
                    <Sidebar/>
                </Button>
            </CardHeader>
            <div className="h-full gap-2 flex flex-col px-2 w-full overflow-y-auto">
                <Separator className="mb-2 w-full"/>
                {noteCtx?.noteContent ? 
                <div ref={contentRef} className="h-full pb-4 pt-4 prose dark:prose-invert min-w-full px-8">
                    <h1 id={slugify(noteCtx?.noteContent?.header || "")}>{noteCtx?.noteContent?.header}</h1>
                    <TypographyLead>{noteCtx?.noteContent?.subtitle}</TypographyLead>
                    <Separator className=""/>
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                        {noteCtx?.noteContent?.content}
                    </Markdown>
                </div>
                : <Empty className="h-full">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Notebook className="text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle className="text-foreground/90">No notes yet</EmptyTitle>
                        <EmptyDescription>Press the generate button to create notes using your sources.</EmptyDescription>
                    </EmptyHeader>
                </Empty>}
            </div>
        </Card>
    </motion.div>
}