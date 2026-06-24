'use client';
import LeftNotebookSidebar from "./(components)/(sidebars)/LeftNotebookSidebar";
import RightNotebookSidebar from "./(components)/(sidebars)/RightNotebookSidebar";
import { LayoutGroup } from "motion/react";
import GenerateNotesDialog from "./(components)/(modals)/GenerateNotesDIalog";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useNotebook } from "@/components/providers/notebook-provider";
import PageHeader from "../../(components)/PageHeader";
import SaveToNotebook from "./(actions)/saveToNotebook";
import { toast } from "sonner";
import MobileTabbar from "./(components)/(sidebars)/MobileTabbar";
import SourcesPanel from "./(components)/SourcesPanel";
import { useNextStep } from "nextstepjs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MainPanel from "./(components)/MainPanel";
import TabsProvider from "@/components/providers/tabs-provider";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function Page(){
    const {isMobile, setOpen} = useSidebar();
    const [selectedTab, setSelectedTab] = useState("notebook");
    const notebook = useNotebook();
    const {currentTour, setCurrentStep} = useNextStep();
    useEffect(()=>{
        if (currentTour == "onboarding"){
            setCurrentStep(6);
        }
    }, [])

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
            {/* <Button variant={"ghost"} size={'icon'}>
                <Settings/>
            </Button> */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>
                        <Button className="ml-2 mr-0" disabled>
                            Share
                            <Share/>
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Sharing is not available yet.</p>
                </TooltipContent>
            </Tooltip>
        </PageHeader>
        <GenerateNotesDialog/>
        <div className="relative flex-1 min-h-0 w-full flex relative">
            {isMobile && <> 
                <div className={`absolute z-20 top-0 z-20 h-full w-full p-2 pb-3 ${selectedTab != "sources" ? "opacity-0 pointer-events-none" : 'opacity-100'}`}>
                    <SourcesPanel/>
                </div>
                <div className={`absolute z-20 top-0 z-30 h-full w-full p-2 pb-3 ${selectedTab != "apps" ? "opacity-0 pointer-events-none" : 'opacity-100'}`}>
                    <RightNotebookSidebar/>
                </div>
            </>}
                <TabsProvider>
                    <div className={`${isMobile && (selectedTab != "notebook" ? "opacity-0 pointer-events-none" : 'opacity-100')} pt-4 pl-4 flex-1 min-h-0 flex`}>
                        <ResizablePanelGroup orientation="horizontal">
                            <ResizablePanel>
                                <MainPanel/>
                            </ResizablePanel>
                            <ResizableHandle className="w-1 bg-transparent hover:bg-muted rounded-lg mx-1"/>
                            <ResizablePanel defaultSize={"350px"} minSize={"350px"} maxSize={"50%"} collapsible>
                                <RightNotebookSidebar/>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                </TabsProvider>
        </div>
        {isMobile && <MobileTabbar selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>}
    </div>
}