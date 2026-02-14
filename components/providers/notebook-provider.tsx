'use client';
import { NoteContentType, NoteMetaType, noteSchema, noteTopicSchema } from "@/app/api/notebook/schema";
import { NotebookContext, NotebookContextType } from "@/lib/contexts";
import { FileListType } from "@/lib/r2actions/getUserFiles";
import { experimental_useObject, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";

export default function NotebookProvider({children, value}: {children: React.ReactNode, value?: NotebookContextType}) {
    // UI States
    const [collapseSections, setCollapseSections] = useState(true);
    const [collapsedSources, setCollapsedSources] = useState(false);
    const [collapsedTools, setCollapsedTools] = useState(false);
    const [collapsedRightSidebar, setCollapsedRightSidebar] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Content States
    const [notesMeta, setNotesMeta] = useState<NoteMetaType | null>(null);
    // const [noteContent, setNoteContent] = useState<NoteContentType | null>(null);
    const [files, setFiles] = useState<FileListType[]>([]);
    const [instructions, setInstructions] = useState<string>("");
    const [topicWeights, setTopicWeights] = useState<Record<string, number>>({});

    const { object:metaObject, submit:metaSubmit, isLoading:isMetaLoading, clear:metaClear, stop:metaStop } = experimental_useObject({
        api: '/api/notebook/generate-meta',
        schema: noteTopicSchema,
        onFinish: (res)=>{
            console.log("Finished generating topics: ", res);
            if (res.error){
                console.error("Error generating topics: ", res.error);
                return;
            } else if (res.object && res.object.topics){
                const weights: Record<string, number> = {};
                res.object.topics.forEach((topic: string)=>{
                    weights[topic] = 100;
                })
                setTopicWeights(weights);
                console.log("Generating notes with instructions:", instructions, "files:", files.map(f=>f.name), "and weights:", weights);
                generateNotes(instructions, files, weights)
            }
        },
        onError: (err)=>{
            console.error("Error generating topics: ", err);
        }
    });
    const { messages:notesHistory, setMessages: setNotesHistory, sendMessage:sendNotesFollowup, status:notesStatus } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/generate-notes',
        }),
        onFinish: (res)=>{
            console.log("Finished generating notes: ", res);
            if (res.isError){
                console.error("Error generating notes: ", res);
                return;
            }
        },
        onError: (err)=>{
            console.error("Error generating notes: ", err);
        }
    }); 
    // const { object:notesObject, submit:notesSubmit, isLoading:isNotesLoading, clear:notesClear, stop:notesStop } = experimental_useObject({
    //     api: '/api/notebook/generate-notes',
    //     schema: noteSchema,
    //     onFinish: (res)=>{
    //         console.log("Finished generating notes: ", res);
    //         if (res.error){
    //             console.error("Error generating notes: ", res.error);
    //             return;
    //         }
    //     },
    //     onError: (err)=>{
    //         console.error("Error generating notes: ", err);
    //     }
    // });

    
    useEffect(()=>{
        if (notesStatus == "streaming"){
            setCollapseSections(false);
        }
    }, [notesStatus])

    // Actions
    function generateMeta(instructions: string, files: FileListType[]){
        console.log("Generating topics with instructions:", instructions, "and files:", files);
        setNotesHistory([]);
        setTopicWeights({});
        setCollapseSections(true);
        metaClear();
        metaSubmit({
            files: files.map(f=>f.name),
            instructions: instructions
        })
    }
    function generateNotes(instructions: string, files: FileListType[], topicWeights: Record<string, number>){
        setNotesHistory([]);
        console.log("Received generating notes request with instructions:", instructions, "files:", files.map(f=>f.name), "and weights:", topicWeights);
        setCollapseSections(true);
        if (topicWeights && Object.keys(topicWeights).length !== 0){
            notesSubmit({
                files: files.map(f=>f.name),
                topicWeights: topicWeights,
                instructions: instructions,
            })
        } else {
            throw new Error("No topic weights provided");
        }
    }
    function stopGeneration(){
        if (isTopicsLoading) {
            topicsStop();
            console.log("Stopped topic generation");
        }
        if (isNotesLoading) {
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
        // Content States
            noteContent, 
            setNoteContent, 
            files, 
            setFiles, 
            activeSection, 
            setActiveSection, 
            topicWeights, 
            setTopicWeights, 
            topicsObject,
            instructions,
            setInstructions,
        // Actions
            generateTopics, 
            generateNotes, 
            isTopicsLoading, 
            isNotesLoading, 
            isGenerating: isTopicsLoading || isNotesLoading,
            stopGeneration, 
            ...value
        }}>
        {children}
    </NotebookContext.Provider>
}