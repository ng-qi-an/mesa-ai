import { NoteContentType } from "@/app/api/notebook/schema";
import { createContext } from "react";
import { FileListType } from "./r2actions/getUserFiles";

export type NotebookContextType = {
    // Define any context properties here
    collapseSections: boolean;
    setCollapseSections: (collapse: boolean) => void;
    collapsedSources: boolean;
    setCollapsedSources: (sources: boolean) => void;
    collapsedTools: boolean;
    setCollapsedTools: (tools: boolean) => void;
    collapsedRightSidebar: boolean;
    setCollapsedRightSidebar: (collapsed: boolean) => void;
    noteContent: NoteContentType | null;
    setNoteContent: (content: NoteContentType | null) => void;
    files: FileListType[];
    setFiles: (files: FileListType[] | ((files: FileListType[]) => FileListType[])) => void;
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
};
export const NotebookContext = createContext<NotebookContextType | undefined>(undefined);