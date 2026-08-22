'use client';
import { generateNoteSchema, GenerateNoteSchemaType } from "@/app/api/notebook/schema";
import { embedImages } from "@/app/dashboard/class/[id]/notebooks/[noteId]/(actions)/embedImages";
import { experimental_useObject } from "@ai-sdk/react";
import { DeepPartial } from "ai";
import { useContext, useEffect, useRef, useState } from "react";
import { createContext } from "react";
import { FileSelect, NotebookSelect } from "@/lib/schemas/schema";
import { useParams } from "next/navigation";
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
    showNotebookCreate: boolean;
    setShowNotebookCreate: (show: boolean) => void;
    editor: BlockNoteEditor<any, any, any>;
    blocks: any[];
    setBlocks: (blocks: any[]) => void;
    setName: (name: string) => void;
    subject: keyof typeof availableSubjects;
    files: FileSelect[];
    sourceFiles: string[];
    setSourceFiles: (fileIds: string[]) => void;
    setFiles: (files: FileSelect[] | ((files: FileSelect[]) => FileSelect[])) => void;
    activeSection: string | null;
    setActiveSection: (section: string | null) => void;
    length: string;
    setLength: (length: string) => void;
    instructions: string;
    setInstructions: (instructions: string) => void;
    // AI States
    notesObject: DeepPartial<GenerateNoteSchemaType> | undefined;
    setNotesObject: (object: DeepPartial<GenerateNoteSchemaType> | undefined) => void;
    notesStatus: "submitted" | "generating" | "error" | "idle";
    notesSubmit: (data: {id: string, length: string, instructions: string}) => void;
    notesStop: () => void;
    notesClear: () => void;
    setNotesStatus: (status: "submitted" | "generating" | "error" | "idle") => void;
    // Loading
    isEmbeddingImages: boolean;
    isStoringFiles: boolean;
    setIsStoringFiles: (storing: boolean) => void;
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
        initialContent: data.blocks || undefined,
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
        links: {
            onClick: () => true,
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
    const [isStoringFiles, setIsStoringFiles] = useState(false);
    const [isEmbeddingImages, setIsEmbeddingImages] = useState(false);
    const [showGenerateNotesDialog, setShowGenerateNotesDialog] = useState(false);
    const [name, setName] = useState(data.name);
    const [showNotebookCreate, setShowNotebookCreate] = useState(data.showNotebookCreate);
    const [files, setFiles] = useState<FileSelect[]>(data.files || []);
    const [blocks, setBlocks] = useState<any[]>(data.blocks || []);
    const [mainChatId, setMainChatId] = useState<string | null>(null);
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
    const [notesStatus, setNotesStatus] = useState<"submitted" | "generating" | "error" | "idle">("idle");
    const [notesObject, setNotesObject] = useState<DeepPartial<GenerateNoteSchemaType> | undefined>(data.content ? {notes: data.content, topics: []} : undefined);

    const { submit: notesSubmit, object: rawNotesObject, stop: notesStop, clear: notesClear } = experimental_useObject({
        api: '/api/notebook/generate-notes',
        schema: generateNoteSchema,
        onFinish: async (res)=>{
            (async ()=>{
                console.log("Finished generating notes: ", res);
                if (res.error){
                    console.error("Error generating notes: ", res);
                    setNotesStatus("error");
                    return;
                }
                if (!res.object){
                    console.error("No object returned from generate-notes API");
                    setNotesStatus("error");
                    return;
                }
                setNotesStatus("idle")
                setIsEmbeddingImages(true);
                if (res.object.notes.trim().length === 0) {
                    console.warn("No markdown content generated, skipping embedding images and saving.");
                    setIsEmbeddingImages(false);
                    return;
                }
                console.log("Starting to embed images in generated notes");
                const embeddedNotes = await embedImages(res.object.notes);
                console.log("Finished embedding images, saving to notebook blocks");
                const finalBlocks = await saveNotebookBlocks(noteId, {markdown: embeddedNotes});
                setBlocks(finalBlocks.blocks);
                setNotesObject({notes: embeddedNotes, topics: res.object.topics});
                setIsEmbeddingImages(false);
                console.log("Finished embedding images");
            })();
        },
        onError: (err)=>{
            console.error("Error generating notes: ", err);
        }
    });
    useEffect(()=>{
        if (rawNotesObject?.notes){
            console.log("raw notes updated")
            if (notesStatus == "submitted"){
                if (rawNotesObject.notes.trim().length > 0) {
                    setNotesStatus("generating")
                }
            }
        }
        if (rawNotesObject){
            setNotesObject(rawNotesObject);
        }
    }, [rawNotesObject, notesStatus])

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
            showNotebookCreate,
            setShowNotebookCreate,
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
            length,
            setLength,
            instructions,
            setInstructions,
        // AI States
            notesObject,
            setNotesObject,
            notesStop,
            notesClear,
            notesSubmit,
        // Actions
            isEmbeddingImages,
            isStoringFiles,
            setIsStoringFiles,
            notesStatus,
            setNotesStatus,
            isContentGenerating: notesStatus != "idle" && notesStatus != "error",
            isGenerating: isStoringFiles || (notesStatus != "idle" && notesStatus != "error"),
        }}>
        {children}
    </NotebookContext.Provider>
}
