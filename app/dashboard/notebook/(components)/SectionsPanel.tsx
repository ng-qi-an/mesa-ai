'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NotebookContext } from "@/lib/contexts";
import { ArrowLeft, ChevronLeft, FileText, Minus, MoreVertical } from "lucide-react";
import { useContext } from "react";
import { motion } from 'motion/react'

// Generate slug matching rehype-slug's algorithm
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function SectionsPanel(){
    const noteCtx = useContext(NotebookContext)
    const isCollapsed = noteCtx?.collapseSections
    
    return <motion.div 
        layout
        animate={{ width: isCollapsed ? 38 : 240 }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        className="h-full gap-2 flex flex-col pt-3 overflow-hidden">
        <div className="w-[240px] h-full flex flex-col gap-2">
            <div className="items-center flex">
                <motion.button 
                    layout="position"
                    onClick={()=> noteCtx?.setCollapseSections(!isCollapsed)} 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 hover:bg-accent hover:text-accent-foreground rounded-md size-8 text-muted-foreground mb-2"
                >
                    <ChevronLeft className={`${isCollapsed ? "rotate-180" : ""} transition-transform duration-300`}/>
                </motion.button>
            </div>
            {/* <Separator className="mb-2"/> */}
            <motion.div layout="position" transition={{type: "spring", bounce: 0.3, duration: 0.4}} animate={{x: !noteCtx?.collapseSections ? 0 : "-100%", opacity: !noteCtx?.collapseSections ? 1 : 0}} className="flex flex-col overflow-y-auto h-full">
            {noteCtx?.noteContent ? ["## "+ noteCtx.noteContent.header, ...noteCtx.noteContent.content.split("\n").filter((x)=> x.split(" ")[0] === "##")].map((section, index) => {
                const sectionTitle = section.replace("##", "").trim();
                const slug = slugify(sectionTitle);
                const isActive = noteCtx?.activeSection === slug;
                return (
                <motion.div onClick={()=> {
                    noteCtx?.setActiveSection(slug);
                    const el = document.getElementById(slug);
                    el?.scrollIntoView({ behavior: 'smooth' });
                }} layout="position" key={index} className="flex items-center gap-2 group px-2 py-2 rounded-md cursor-pointer">
                    <Minus className={`${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"} size-5.5`}/>
                    <p className={`${isActive ? 'font-medium' : 'text-muted-foreground group-hover:text-foreground/80'} truncate text-sm w-full`}>
                        {sectionTitle}
                    </p>
                </motion.div>
            )}) : <p className="text-xs text-muted-foreground text-center">Your section headers will appear here.</p>}
            </motion.div>
        </div>
    </motion.div>
}