'use client';
import LeftNotebookSidebar from "./(components)/(sidebars)/LeftNotebookSidebar";
import NotebookPanel from "./(components)/NotebookPanel";
import RightNotebookSidebar from "./(components)/(sidebars)/RightNotebookSidebar";
import { LayoutGroup } from "motion/react";
import GenerateNotesDialog from "./(components)/(modals)/GenerateNotesDIalog";
import { Button } from "@/components/ui/button";
import { Settings, Share } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useNotebook } from "@/components/providers/notebook-provider";
import PageHeader from "../../(components)/PageHeader";
import SaveToNotebook from "./(actions)/saveToNotebook";
import { toast } from "sonner";
import MobileTabbar from "./(components)/(sidebars)/MobileTabbar";
import SourcesPanel from "./(components)/SourcesPanel";
import AppsPanel from "./(components)/AppsPanel";

export default function Page(){
    const {isMobile, setOpen} = useSidebar();
    const [selectedTab, setSelectedTab] = useState("notebook");
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
                <div className="relative flex-1 min-h-0 w-full flex overflow-hidden relative pb-3 sm:pb-4">
                    {isMobile && <> 
                        <div className={`absolute z-20 top-0 z-20 h-full w-full p-2 pb-3 ${selectedTab != "sources" ? "opacity-0 pointer-events-none" : 'opacity-100'}`}>
                            <SourcesPanel/>
                        </div>
                        <div className={`absolute z-20 top-0 z-30 h-full w-full p-2 pb-3 ${selectedTab != "apps" ? "opacity-0 pointer-events-none" : 'opacity-100'}`}>
                            <RightNotebookSidebar/>
                        </div>
                    </>}
                    <div className={`${isMobile && (selectedTab != "notebook" ? "opacity-0 pointer-events-none" : 'opacity-100')} px-2 sm:px-4 gap-3 mt-2 sm:mt-5 flex-1 min-h-0 flex overflow-hidden`}>
                        {!isMobile && <LeftNotebookSidebar/>}
                        <NotebookPanel/>
                        {!isMobile && <RightNotebookSidebar/>}
                    </div>
                </div>
                {isMobile && <MobileTabbar selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>}
        </LayoutGroup>
    </div>
}