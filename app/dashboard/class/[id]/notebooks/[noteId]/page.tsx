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

export default function Page(){
    return <div className="flex flex-col h-screen">
        <div className="w-full flex items-center py-4 px-6">
            <Link href={"/dashboard"}>
                <Logo type="favicon" className="size-7 invert hover:opacity-80"/>
            </Link>
            <h1 className="pl-4 font-medium">Mesa Notebook</h1>
            <div className="flex-1"/>
            <Button variant={"ghost"} size={'icon'}>
                <Settings/>
            </Button>
            <Button className="ml-2 mr-0">
                Share
                <Share/>
            </Button>
        </div>
        <LayoutGroup>
            <GenerateNotesDialog/>
            <div className="flex-1 min-h-0 w-full flex px-4 pb-4 gap-3">
                <LeftNotebookSidebar/>
                <NotebookPanel/>
                <RightNotebookSidebar/>
            </div>
        </LayoutGroup>
    </div>
}