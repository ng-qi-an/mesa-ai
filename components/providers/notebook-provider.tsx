'use client';
import { NoteContentType } from "@/app/api/notebook/schema";
import { NotebookContext, NotebookContextType } from "@/lib/contexts";
import { FileListType } from "@/lib/r2actions/getUserFiles";
import { useState } from "react";

export default function NotebookProvider({children, value}: {children: React.ReactNode, value?: NotebookContextType}) {
    const [collapseSections, setCollapseSections] = useState(false);
    const [collapsedSources, setCollapsedSources] = useState(false);
    const [collapsedTools, setCollapsedTools] = useState(false);
    const [collapsedRightSidebar, setCollapsedRightSidebar] = useState(false);
    const [noteContent, setNoteContent] = useState<NoteContentType | null>(null);
    const [files, setFiles] = useState<FileListType[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    return <NotebookContext.Provider value={{collapseSections, setCollapseSections, collapsedSources, setCollapsedSources, collapsedTools, setCollapsedTools, collapsedRightSidebar, setCollapsedRightSidebar, noteContent, setNoteContent, files, setFiles, activeSection, setActiveSection, ...value}}>
        {children}
    </NotebookContext.Provider>
}