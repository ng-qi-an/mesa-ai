import { NoteContentType } from "@/app/api/notebook/schema";
import { createContext } from "react";
import { FileListType } from "./r2actions/getUserFiles";
import { UIMessage } from "ai";

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
    // noteContent: NoteContentType | null;
    // setNoteContent: (content: NoteContentType | null) => void;
    notesMessages: UIMessage[],
    files: FileListType[];
    setFiles: (files: FileListType[] | ((files: FileListType[]) => FileListType[])) => void;
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
    instructions: string;
    setInstructions: (instructions: string) => void;
    topicWeights: Record<string, number>;
    setTopicWeights: (weights: Record<string, number>) => void;
    generateTopics: (instructions: string, files: FileListType[]) => void;
    generateNotes: (instructions: string, files: FileListType[], topicWeights: Record<string, number>) => void;
    stopGeneration: () => void;
    topicsObject: any;
    isTopicsLoading: boolean;
    isNotesLoading: boolean;
    isGenerating: boolean;
};
export const NotebookContext = createContext<NotebookContextType | undefined>(undefined);