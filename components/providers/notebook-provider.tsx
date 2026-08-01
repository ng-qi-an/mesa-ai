'use client';
import { noteMetaSchema } from "@/app/api/notebook/schema";
import { embedImages } from "@/app/dashboard/class/[id]/notebooks/[noteId]/(actions)/embedImages";
import { defaultNotesInstructions, generateNotes } from "@/app/dashboard/class/[id]/notebooks/[noteId]/(actions)/generateNotes";
import { experimental_useObject, useChat } from "@ai-sdk/react";
import { ChatStatus, DeepPartial, DefaultChatTransport, generateId, UIMessage } from "ai";
import { useContext, useEffect, useRef, useState } from "react";
import { NoteMetaType } from "@/app/api/notebook/schema";
import { createContext } from "react";
import { FileSelect, NotebookSelect } from "@/lib/schemas/schema";
import { useParams } from "next/navigation";
import SaveToNotebook from "@/app/dashboard/class/[id]/notebooks/[noteId]/(actions)/saveToNotebook";
import { useClass } from "./class-provider";
import { availableSubjects } from "@/lib/subjects/subjectsList";
import saveNotebookBlocks from "@/lib/actions/notebook/saveNotebookBlocks";
import { useCreateBlockNote } from "@blocknote/react";
import { notebookSchema } from "@/app/dashboard/class/[id]/notebooks/[noteId]/(components)/(notebook)/NotebookSchema";
import { InlineMathInputRule } from "@/app/dashboard/class/[id]/notebooks/[noteId]/(components)/(notebook)/mathExtensionUtils";
import { BlockNoteEditor } from "@blocknote/core";
import { AIExtension } from "@blocknote/xl-ai";
import { en } from "@blocknote/core/locales";
import { en as aiEn } from "@blocknote/xl-ai/locales";

export type NotebookContextType = {
    // Ui States
    collapseSections: boolean;
    setCollapseSections: (collapse: boolean) => void;
    collapsedSources: boolean;
    setCollapsedSources: (sources: boolean) => void;
    collapsedApps: boolean;
    setCollapsedApps: (Apps: boolean) => void;
    collapsedRightSidebar: boolean;
    setCollapsedRightSidebar: (collapsed: boolean) => void;
    showGenerateNotesDialog: boolean;
    setShowGenerateNotesDialog: (show: boolean) => void;
    // Content States
    noteId: string;
    mainChatId: string | null;
    setMainChatId: (id: string | null) => void;
    name: string;
    editor: BlockNoteEditor<any, any, any>;
    blocks: any[];
    setBlocks: (blocks: any[]) => void;
    setName: (name: string) => void;
    subject: keyof typeof availableSubjects;
    files: FileSelect[];
    sourceFiles: string[];
    setSourceFiles: (fileIds: string[]) => void;
    // setCache: (name: string, fileIds: string[]) => void;
    // cache: {name: string, fileIds: string[]} | null;
    setFiles: (files: FileSelect[] | ((files: FileSelect[]) => FileSelect[])) => void;
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
    length: string;
    setLength: (length: string) => void;
    instructions: string;
    setInstructions: (instructions: string) => void;
    topicWeights: Record<string, number>;
    setTopicWeights: (weights: Record<string, number>) => void;
    getActualNotes: (history: UIMessage[]) => string;
    stopGeneration: () => void;
    // AI States
    metaObject: DeepPartial<NoteMetaType> | undefined;
    setMetaObject: (metaObject: DeepPartial<NoteMetaType> | undefined) => void;
    metaSubmit: (input: any) => void;
    metaStop: () => void;
    notesHistory: UIMessage[],
    setNotesHistory: (messages: UIMessage[]) => void
    sendNotesFollowup: (message: { text: string }, options?: { body?: { topicWeights?: Record<string, number>, cacheName?: string } }) => void;
    notesStop: () => Promise<void>;
    // Loading
    isNotesLoading: boolean;
    isMetaLoading: boolean;
    isEmbeddingImages: boolean;
    isStoringFiles: boolean;
    setIsStoringFiles: (storing: boolean) => void;
    // isCacheLoading: boolean;
    // setIsCacheLoading: (loading: boolean) => void;
    notesStatus: ChatStatus;
    isContentGenerating: boolean;    
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

export default function NotebookProvider({children, data}: {children: React.ReactNode, data: NotebookSelect & {files: FileSelect[]}}) {
    // UI States
    const {noteId}:{noteId: string} = useParams();
    const {_class} = useClass();
    const editor = useCreateBlockNote({
        schema: notebookSchema,
        tables: {
            splitCells: true,
            cellBackgroundColor: true,
            cellTextColor: true,
            headers: true,
        },
        dictionary: {
            ...en,
            ai: aiEn, // add default translations for the AI extension
        },
        _tiptapOptions: {
            extensions: [InlineMathInputRule],
        },
        extensions: [AIExtension()],
    });
    const [collapseSections, setCollapseSections] = useState(data.content ? false :true);
    const [collapsedSources, setCollapsedSources] = useState(false);
    const [collapsedApps, setCollapsedApps] = useState(false);
    const [collapsedRightSidebar, setCollapsedRightSidebar] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    // const [isCacheLoading, setIsCacheLoading] = useState(false);
    const [isStoringFiles, setIsStoringFiles] = useState(false);
    const [isEmbeddingImages, setIsEmbeddingImages] = useState(false);
    const [showGenerateNotesDialog, setShowGenerateNotesDialog] = useState(false);
    // Content States
    // const [cache, _setCache] = useState<{
    //     name: string;
    //     fileIds: string[];
    // } | null>(data.cache);
    // const cacheRef = useRef<{name: string, fileIds: string[]} | null>(null);
    // const setCache = (name: string, fileIds: string[]) => {
    //     cacheRef.current = {name, fileIds};
    //     _setCache({name, fileIds});
    // };
    const [name, setName] = useState(data.name);
    const [files, setFiles] = useState<FileSelect[]>(data.files || []);
    const [blocks, setBlocks] = useState<any[]>(data.blocks || []);
    const [mainChatId, setMainChatId] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [sourceFiles, setSourceFiles] = useState<string[]>(data.sourceFiles || []);
    const instructionsRef = useRef<string>(data.instructions || "");
    const [instructionsState, setInstructionsState] = useState<string>(data.instructions || "");
    const setInstructions = (newInstructions: string) => {
        instructionsRef.current = newInstructions;
        setInstructionsState(newInstructions);
    };
    const lengthRef = useRef<string>(data.length || "balanced");
    const [lengthState, setLengthState] = useState(data.length || "balanced");
    const setLength = (newLength: string) => {
        lengthRef.current = newLength;
        setLengthState(newLength);
    };
    const instructions = instructionsState;
    const length = lengthState;
    const [topicWeights, setTopicWeights] = useState<Record<string, number>>(data.topicWeights ||{});

    // AI States
    const [metaObject, setMetaObject] = useState<DeepPartial<NoteMetaType> | undefined>(data.topicWeights && data.title && data.subtitle ? {topics: Object.keys(data.topicWeights), header: data.title, subtitle: data.subtitle} : undefined);
    const { object:internalMetaObject, submit:metaSubmit, isLoading:isMetaLoading, stop:metaStop } = experimental_useObject({
        api: '/api/notebook/generate-meta',
        schema: noteMetaSchema,
        onFinish: async(res)=>{
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
                const resolvedInstructions = instructionsRef.current;
                const resolvedLength = lengthRef.current;
                // console.log("Generating notes with instructions:", resolvedInstructions, "files:", files.map(f=>f.name), "and weights:", weights, "and cache:", cacheRef.current);
                // /cache: cacheRef.current, 
                const payload:Record<string, any> = {instructions: resolvedInstructions, length: resolvedLength, topicWeights: weights, title: res.object.header, subtitle: res.object.subtitle}
                if (name == "New Notebook"){
                    setName(res.object.header);
                    payload.name = res.object.header;
                }
                await SaveToNotebook(noteId, payload);
                generateNotes({noteId, instructions: `${defaultNotesInstructions(resolvedLength, _class.subject, resolvedInstructions, Object.keys((weights)))}`, length: resolvedLength, fileIds: files.map(f=>f.id), topicWeights: weights, setCollapseSections, sendNotesFollowup, fileStoreId: _class.fileStoreId!});
            }
        },
        onError: (err)=>{
            console.error("Error generating meta: ", err);
        }
    });
    useEffect(()=>{
        if (internalMetaObject){
            setMetaObject(internalMetaObject);
        }
    }, [internalMetaObject])
    const { messages:notesHistory, setMessages: setNotesHistory, sendMessage:sendNotesFollowup, status:notesStatus, stop: notesStop, regenerate } = useChat({
        messages: [],
        transport: new DefaultChatTransport({
            api: '/api/notebook/generate-notes',
        }),
        onFinish: async (res)=>{
            console.log("Finished generating notes: ", res);
            if (res.isError){
                console.error("Error generating notes: ", res);
                return;
            }
            if (res.finishReason == "other"){
                if (retryCount >= 2){
                    return
                }
                console.warn("Generation stopped unexpectedly, retrying... Reattempt ", retryCount + 1);
                regenerate();
                setRetryCount(retryCount + 1);
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
            const markdown = finalMessage.parts.map((part) => part.type === "text" ? part.text : "").join("");
            if (markdown.trim().length === 0) {
                console.warn("No markdown content generated, skipping embedding images and saving.");
                setIsEmbeddingImages(false);
                return;
            }
            const finalBlocks = await saveNotebookBlocks(noteId, {markdown});
            setBlocks(finalBlocks.blocks);
            setIsEmbeddingImages(false);
            console.log("Finished embedding images");
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
        if (!history){
            return "";
        }
        const assistantMessages = history.filter((x)=> x.role == "assistant");
        if (assistantMessages.length === 0) {
            return ""
        }
        return assistantMessages[assistantMessages.length - 1].parts.map((part)=> part.type == "text" ? part.text : null).join("");
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
            collapsedApps, 
            setCollapsedApps, 
            collapsedRightSidebar, 
            setCollapsedRightSidebar, 
            showGenerateNotesDialog,
            setShowGenerateNotesDialog,
        // Content States
            noteId,
            mainChatId,
            setMainChatId,
            subject: _class.subject,
            editor: editor,
            blocks: blocks,
            setBlocks: setBlocks,
            name,
            setName,
            files, 
            setFiles, 
            sourceFiles,
            setSourceFiles,
            activeSection, 
            setActiveSection, 
            topicWeights, 
            setTopicWeights, 
            length,
            setLength,
            instructions,
            setInstructions,
            // setCache,
            // cache: cache ?? null,
        // AI States
            metaObject,
            metaSubmit, 
            setMetaObject, 
            metaStop,
            notesHistory, 
            setNotesHistory,
            sendNotesFollowup,
            notesStop,
        // Actions
            isMetaLoading, 
            notesStatus,
            isEmbeddingImages,
            // isCacheLoading,
            // setIsCacheLoading,
            isStoringFiles,
            setIsStoringFiles,
            isNotesLoading: notesStatus == "streaming" || notesStatus == "submitted",
            isContentGenerating: isMetaLoading || notesStatus == "streaming" || notesStatus == "submitted",
            isGenerating: isStoringFiles || isMetaLoading || notesStatus == "streaming" || notesStatus == "submitted",
            getActualNotes,
            stopGeneration, 
        }}>
        {children}
    </NotebookContext.Provider>
}