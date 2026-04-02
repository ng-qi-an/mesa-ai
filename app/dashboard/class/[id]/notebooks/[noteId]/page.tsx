'use client';
import LeftNotebookSidebar from "./(components)/(sidebars)/LeftNotebookSidebar";
import NotebookPanel from "./(components)/NotebookPanel";
import RightNotebookSidebar from "./(components)/(sidebars)/RightNotebookSidebar";
import { LayoutGroup } from "motion/react";
import GenerateNotesDialog from "./(components)/(modals)/GenerateNotesDIalog";
import { Button } from "@/components/ui/button";
import { Settings, Share } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useNotebook } from "@/components/providers/notebook-provider";
import { useParams } from "next/navigation";
import PageHeader from "../../(components)/PageHeader";
import SaveToNotebook from "./(actions)/saveToNotebook";
import { toast } from "sonner";

export default function Page(){
    const {isMobile, setOpen} = useSidebar();
    const notebook = useNotebook();
    useEffect(()=>{
        if (!isMobile){
            setOpen(false);
        }
        return()=>{
            if (!isMobile){
                setOpen(true);
            }
        }
    }, [])
    return <div className="flex flex-col h-screen">
        <PageHeader titleEditable onTitleSubmit={async(x)=> {
            const oldName = notebook.name;
            notebook.setName(x);
            try {
                await SaveToNotebook(notebook.noteId, {name: x});
            } catch (error) {
                toast.error("Failed to update notebook name. Please try again.");
                notebook.setName(oldName);
            }
        }} pages={[{name: "Notebooks", href: `/notebooks`}, {name: notebook.name || "Notebook"}]}>
            <Button variant={"ghost"} size={'icon'}>
                <Settings/>
            </Button>
            <Button className="ml-2 mr-0">
                Share
                <Share/>
            </Button>
        </PageHeader>
        <LayoutGroup>
            <GenerateNotesDialog/>
            <div className="flex-1 min-h-0 w-full flex px-4 pb-4 gap-3 mt-5 overflow-hidden">
                <LeftNotebookSidebar/>
                <NotebookPanel/>
                <RightNotebookSidebar/>
            </div>
        </LayoutGroup>
    </div>
}