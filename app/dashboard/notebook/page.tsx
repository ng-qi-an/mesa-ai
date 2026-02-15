'use client';
import LeftNotebookSidebar from "./(components)/(sidebars)/LeftNotebookSidebar";
import NotebookPanel from "./(components)/NotebookPanel";
import RightNotebookSidebar from "./(components)/(sidebars)/RightNotebookSidebar";
import NotebookProvider from "@/components/providers/notebook-provider";
import { LayoutGroup } from "motion/react";
import GenerateNotesDialog from "./(components)/(modals)/GenerateNotesDIalog";

export default function Page(){
    return <NotebookProvider>
        <LayoutGroup>
            <GenerateNotesDialog/>
            <div className="flex-1 min-h-0 w-full flex px-4 pb-4 gap-3">
                <LeftNotebookSidebar/>
                <NotebookPanel/>
                <RightNotebookSidebar/>
            </div>
        </LayoutGroup>
    </NotebookProvider>
}