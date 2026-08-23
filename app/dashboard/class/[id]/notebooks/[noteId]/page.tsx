'use client';
import RightNotebookSidebar from "./(components)/(sidebars)/RightNotebookSidebar";
import GenerateNotesDialog from "./(components)/(modals)/GenerateNotesDIalog";
import { Button } from "@/components/ui/button";
import { Construction, Share } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useNotebook } from "@/components/providers/notebook-provider";
import PageHeader from "../../(components)/PageHeader";
import SaveToNotebook from "./(actions)/saveToNotebook";
import { toast } from "sonner";
import { useNextStep } from "nextstepjs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MainPanel from "./(components)/MainPanel";
import TabsProvider from "@/components/providers/tabs-provider";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useClass } from "@/components/providers/class-provider";
import { useRouter } from "nextjs-toploader/app";

export default function Page(){
    const {isMobile, setOpen} = useSidebar();
    const [selectedTab, setSelectedTab] = useState("notebook");
    const notebook = useNotebook();
    const {currentTour, setCurrentStep} = useNextStep();
    const router = useRouter();
    const {_class} = useClass();
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
            {isMobile ? <> 
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Construction/>
                        </EmptyMedia>
                        <EmptyTitle>Unsupported device!</EmptyTitle>
                        <EmptyDescription>Notebooks aren't supported on mobile devices yet.</EmptyDescription>
                    </EmptyHeader>
                    <Button onClick={()=> router.push(`/dashboard/class/${_class.id}/notebooks`)} variant="raised">Go back</Button>
                </Empty>
            </>:
            <TabsProvider>
                <div className={`${isMobile && (selectedTab != "notebook" ? "opacity-0 pointer-events-none" : 'opacity-100')} p-3 flex-1 min-h-0 flex`}>
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
            </TabsProvider>}
        </div>
        {/* {isMobile && <MobileTabbar selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>} */}
    </div>
}