'use client';
import { noteMetaSchema } from "@/app/api/notebook/schema";
import { embedImages } from "@/app/dashboard/class/[id]/notebooks/[noteId]/(actions)/embedImages";
import { defaultNotesInstructions, generateNotes } from "@/app/dashboard/class/[id]/notebooks/[noteId]/(actions)/generateNotes";
import createCache from "@/lib/cache-actions/createCache";
import createOrExtendCache from "@/lib/cache-actions/createOrExtendCache";
import { FileListType } from "@/lib/r2actions/getUserFiles";
import { experimental_useObject, useChat } from "@ai-sdk/react";
import { ChatStatus, DefaultChatTransport, UIMessage } from "ai";
import { useContext, useEffect, useRef, useState } from "react";
import { NoteMetaType } from "@/app/api/notebook/schema";
import { createContext } from "react";
import { DeepPartial } from "better-auth";
import { FileSelect, NotebookFileSelect } from "@/lib/schemas/schema";
import { useParams } from "next/navigation";

export type NotebookContextType = {
    // Ui States
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
    noteId: string;
    files: FileSelect[];
    setCache: (name: string, fileIds: string[]) => void;
    cache: {name: string, fileIds: string[]} | null;
    setFiles: (files: FileSelect[] | ((files: FileSelect[]) => FileSelect[])) => void;
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
    instructions: string;
    setInstructions: (instructions: string) => void;
    topicWeights: Record<string, number>;
    setTopicWeights: (weights: Record<string, number>) => void;
    getActualNotes: (history: UIMessage[]) => string;
    stopGeneration: () => void;
    // AI States
    metaObject: DeepPartial<NoteMetaType> | undefined;
    metaSubmit: (input: any) => void;
    metaClear: () => void;
    metaStop: () => void;
    notesHistory: UIMessage[],
    setNotesHistory: (messages: UIMessage[]) => void
    sendNotesFollowup: (message: { text: string }, options?: { body?: { topicWeights?: Record<string, number>, cacheName?: string } }) => void;
    notesStop: () => Promise<void>;
    // Loading
    isNotesLoading: boolean;
    isMetaLoading: boolean;
    isEmbeddingImages: boolean;
    isCacheLoading: boolean;
    setIsCacheLoading: (loading: boolean) => void;
    notesStatus: ChatStatus;
    isGenerating: boolean;
};



export const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export function useNotebook() {
    const context = useContext(NotebookContext);
    if (!context) {
        throw new Error("useNotebook must be used within a NotebookProvider");
    }
    return context;
}

export default function NotebookProvider({children, data}: {children: React.ReactNode, data: Partial<NotebookContextType>}) {
    // UI States
    const {noteId}:{noteId: string} = useParams();
    const [collapseSections, setCollapseSections] = useState(true);
    const [collapsedSources, setCollapsedSources] = useState(false);
    const [collapsedTools, setCollapsedTools] = useState(false);
    const [collapsedRightSidebar, setCollapsedRightSidebar] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isCacheLoading, setIsCacheLoading] = useState(false);
    const [isEmbeddingImages, setIsEmbeddingImages] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showGenerateNotesDialog, setShowGenerateNotesDialog] = useState(false);
    // Content States
    const [cache, _setCache] = useState<{
        name: string;
        fileIds: string[];
    }>();
    const cacheRef = useRef<{name: string, fileIds: string[]} | null>(null);
    const setCache = (name: string, fileIds: string[]) => {
        cacheRef.current = {name, fileIds};
        _setCache({name, fileIds});
    };
    // const [noteContent, setNoteContent] = useState<NoteContentType | null>(null);
    const [files, setFiles] = useState<FileSelect[]>(data.files || []);
    const [instructions, setInstructions] = useState<string>("");
    const [topicWeights, setTopicWeights] = useState<Record<string, number>>({});

    // AI States
    const { object:metaObject, submit:metaSubmit, isLoading:isMetaLoading, clear:metaClear, stop:metaStop } = experimental_useObject({
        api: '/api/notebook/generate-meta',
        schema: noteMetaSchema,
        onFinish: (res)=>{
            console.log("Finished generating meta: ", res);
            if (res.error){
                console.error("Error generating meta: ", res.error);
                return;
            } else if (res.object && res.object.topics){
                const weights: Record<string, number> = {};
                res.object.topics.forEach((topic: string)=>{
                    weights[topic] = 100;
                })
                setTopicWeights(weights);
                console.log("Generating notes with instructions:", instructions, "files:", files.map(f=>f.name), "and weights:", weights, "and cache:", cacheRef.current);
                generateNotes({instructions: defaultNotesInstructions, fileIds: files.map(f=>f.id), topicWeights: weights, cache: cacheRef.current, setCollapseSections, setIsCacheLoading, setCache, sendNotesFollowup});
            }
        },
        onError: (err)=>{
            console.error("Error generating meta: ", err);
        }
    });
    const { messages:notesHistory, setMessages: setNotesHistory, sendMessage:sendNotesFollowup, status:notesStatus, stop: notesStop } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/notebook/generate-notes',
        }),
        onFinish: async (res)=>{
            console.log("Finished generating notes: ", res);
            if (res.isError){
                console.error("Error generating notes: ", res);
                return;
            }
            setIsEmbeddingImages(true);
            const parts = await Promise.all(
                res.message.parts.map(async (part) => 
                    part.type == "text" 
                        ? { ...part, text: await embedImages(part.text) } 
                        : part
                )
            );
            const finalMessage = { ...res.message, parts };
            const updatedMessages = [...notesHistory];
            updatedMessages[updatedMessages.length - 1] = finalMessage;
            setNotesHistory(updatedMessages);
            setIsEmbeddingImages(false);
        },
        onError: (err)=>{
            console.error("Error generating notes: ", err);
        }
    });


    useEffect(()=>{
        if (notesStatus == "streaming"){
            setCollapseSections(false);
        }
    }, [notesStatus])

    // Actions
    
    function getActualNotes(history: UIMessage[]){
        if (!history || history.length === 0) {
            return ""
        }
        return history[history.length - 1].parts.map((part)=> part.type == "text" ? part.text : null).join("");
    }
    function stopGeneration(){
        if (isMetaLoading) {
            metaStop();
            console.log("Stopped meta generation");
        }
        if (notesStatus == "streaming") {
            notesStop();
            console.log("Stopped notes generation");
        }
    }

    return <NotebookContext.Provider value={{
        // UI States
            collapseSections, 
            setCollapseSections, 
            collapsedSources, 
            setCollapsedSources, 
            collapsedTools, 
            setCollapsedTools, 
            collapsedRightSidebar, 
            setCollapsedRightSidebar, 
            showGenerateNotesDialog,
            setShowGenerateNotesDialog,
        // Content States
            noteId,
            files, 
            setFiles, 
            activeSection, 
            setActiveSection, 
            topicWeights, 
            setTopicWeights, 
            instructions,
            setInstructions,
            setCache,
            cache: cache ?? null,
        // AI States
            metaObject,
            metaSubmit, 
            metaClear, 
            metaStop,
            notesHistory, 
            setNotesHistory,
            sendNotesFollowup,
            notesStop,
        // Actions
            isMetaLoading, 
            notesStatus,
            isEmbeddingImages,
            isCacheLoading,
            setIsCacheLoading,
            isNotesLoading: notesStatus == "streaming" || notesStatus == "submitted",
            isGenerating: isCacheLoading || isMetaLoading || notesStatus == "streaming" || notesStatus == "submitted",
            getActualNotes,
            stopGeneration, 
        }}>
        {children}
    </NotebookContext.Provider>
}