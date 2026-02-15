import { NoteMetaType } from "@/app/api/notebook/schema";
import { createContext } from "react";
import { FileListType } from "./r2actions/getUserFiles";
import { DeepPartial, UIMessage } from "ai";

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
    showGenerateNotesDialog: boolean;
    setShowGenerateNotesDialog: (show: boolean) => void;
    // Content States
    notesHistory: UIMessage[],
    files: FileListType[];
    setCache: (name: string, files: FileListType[]) => void;
    cache: {name: string, files: FileListType[]} | null;
    setFiles: (files: FileListType[] | ((files: FileListType[]) => FileListType[])) => void;
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
    instructions: string;
    setInstructions: (instructions: string) => void;
    topicWeights: Record<string, number>;
    setTopicWeights: (weights: Record<string, number>) => void;
    checkCacheMatch: (cacheFiles: FileListType[], files: FileListType[]) => boolean;
    generateMeta: (instructions: string, files: FileListType[], cacheName?: string) => void;
    generateNotes: (instructions: string, files: FileListType[], topicWeights: Record<string, number>, cache: {name: string, files: FileListType[]} | null) => void;
    getActualNotes: (history: UIMessage[]) => string;
    stopGeneration: () => void;
    metaObject: DeepPartial<NoteMetaType> | undefined;
    isNotesLoading: boolean;
    isMetaLoading: boolean;
    isEmbeddingImages: boolean;
    isCacheLoading: boolean;
    notesStatus: string;
    isGenerating: boolean;
};
export const NotebookContext = createContext<NotebookContextType | undefined>(undefined);