'use client';
import { NoteContentType, noteSchema, noteTopicSchema } from "@/app/api/notebook/schema";
import { NotebookContext, NotebookContextType } from "@/lib/contexts";
import { FileListType } from "@/lib/r2actions/getUserFiles";
import { experimental_useObject } from "@ai-sdk/react";
import { useEffect, useState } from "react";

export default function NotebookProvider({children, value}: {children: React.ReactNode, value?: NotebookContextType}) {
    // UI States
    const [collapseSections, setCollapseSections] = useState(true);
    const [collapsedSources, setCollapsedSources] = useState(false);
    const [collapsedTools, setCollapsedTools] = useState(false);
    const [collapsedRightSidebar, setCollapsedRightSidebar] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Content States
    const [noteContent, setNoteContent] = useState<NoteContentType | null>(null);
    const [files, setFiles] = useState<FileListType[]>([]);
    const [instructions, setInstructions] = useState<string>("");
    const [topicWeights, setTopicWeights] = useState<Record<string, number>>({});

    const { object:topicsObject, submit:topicsSubmit, isLoading:isTopicsLoading, clear:topicsClear, stop:topicsStop } = experimental_useObject({
        api: '/api/notebook/generate-topics',
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
    const { object:notesObject, submit:notesSubmit, isLoading:isNotesLoading, clear:notesClear, stop:notesStop } = experimental_useObject({
        api: '/api/notebook/generate-notes',
        schema: noteSchema,
        onFinish: (res)=>{
            console.log("Finished generating notes: ", res);
            if (res.error){
                console.error("Error generating notes: ", res.error);
                return;
            }
        },
        onError: (err)=>{
            console.error("Error generating notes: ", err);
        }
    });

    
    useEffect(()=>{
        if (notesObject && notesObject.header && notesObject.subtitle && notesObject.content){
            setCollapseSections(false);
            setNoteContent({
                header: notesObject.header,
                subtitle: notesObject.subtitle,
                content: notesObject.content,
            })
        }
    }, [notesObject])

    // Actions
    function generateTopics(instructions: string, files: FileListType[]){
        console.log("Generating topics with instructions:", instructions, "and files:", files);
        notesClear();
        setTopicWeights({});
        setNoteContent(null);
        setCollapseSections(true);
        topicsClear();
        topicsSubmit({
            files: files.map(f=>f.name),
            instructions: instructions
        })
    }
    function generateNotes(instructions: string, files: FileListType[], topicWeights: Record<string, number>){
        notesClear();
        console.log("Received generating notes request with instructions:", instructions, "files:", files.map(f=>f.name), "and weights:", topicWeights);
        setNoteContent(null);
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