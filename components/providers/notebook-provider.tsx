'use client';
import { noteMetaSchema } from "@/app/api/notebook/schema";
import { embedImages } from "@/app/dashboard/notebook/(actions)/embedImages";
import { defaultNotesInstructions } from "@/app/dashboard/notebook/(actions)/generateNotes";
import createCache from "@/lib/cache-actions/createCache";
import createOrExtendCache from "@/lib/cache-actions/createOrExtendCache";
import { NotebookContext, NotebookContextType } from "@/lib/contexts";
import { FileListType } from "@/lib/r2actions/getUserFiles";
import { experimental_useObject, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";

export default function NotebookProvider({children, value}: {children: React.ReactNode, value?: NotebookContextType}) {
    // UI States
    const [collapseSections, setCollapseSections] = useState(true);
    const [collapsedSources, setCollapsedSources] = useState(false);
    const [collapsedTools, setCollapsedTools] = useState(false);
    const [collapsedRightSidebar, setCollapsedRightSidebar] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isCacheLoading, setIsCacheLoading] = useState(false);
    const [isEmbeddingImages, setIsEmbeddingImages] = useState(false);
    const [showGenerateNotesDialog, setShowGenerateNotesDialog] = useState(false);
    // Content States
    const [cache, _setCache] = useState<{
        name: string;
        files: FileListType[];
    }>();
    const cacheRef = useRef<{name: string, files: FileListType[]} | null>(null);
    const setCache = (name: string, files: FileListType[]) => {
        cacheRef.current = {name, files};
        _setCache({name, files});
    };
    // const [noteContent, setNoteContent] = useState<NoteContentType | null>(null);
    const [files, setFiles] = useState<FileListType[]>([]);
    const [instructions, setInstructions] = useState<string>("");
    const [topicWeights, setTopicWeights] = useState<Record<string, number>>({});

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
                generateNotes(defaultNotesInstructions, files, weights, cacheRef.current);
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
    async function generateMeta(instructions: string, files: FileListType[]){
        console.log("Generating topics with instructions:", instructions, "and files:", files);
        setNotesHistory([]);
        setTopicWeights({});
        setIsCacheLoading(true);
        const newCache = await createCache(files.map(f=>f.name), 900);
        console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
        setCache(newCache.name!, files);
        setIsCacheLoading(false);
        setCollapseSections(true);
        metaClear();
        metaSubmit({
            files: files.map(f=>f.name),
            cacheName: newCache.name!,
            instructions: instructions
        })
    }
    async function generateNotes(instructions: string, files: FileListType[], topicWeights: Record<string, number>, cache: {name: string; files: FileListType[]} | null ){
        console.log("Received generating notes request with instructions:", instructions, "files:", files.map(f=>f.name), "and weights:", topicWeights, "and cache:", cache);
        setCollapseSections(true);
        setIsCacheLoading(true);
        let newCache;
        if (!cache || !checkCacheMatch(cache.files, files)){
            console.log("[GEN NOTES] Cache files differ from provided files. Creating cache...");
            newCache = await createCache(files.map(f=>f.name), 900)
        } else {
            console.log("[GEN NOTES] Cache files match provided files. Extending cache...");
            newCache = await createOrExtendCache(cache.name, files.map(f=>f.name), 900)
        }
        setIsCacheLoading(false);
        console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
        setCache(newCache.name!, files);
        if (topicWeights && Object.keys(topicWeights).length !== 0){
            sendNotesFollowup({
                text: `
                    # Topic weights
                        ${Object.keys(topicWeights).map((topic) => `- ${topic}: ${topicWeights[topic]}`).join("\n")}
                    # Instructions
                    ${instructions}
                `,
            }, {
                body: {
                    topicWeights: topicWeights,
                    cacheName: newCache.name!
                }
            })
        } else {
            throw new Error("No topic weights provided");
        }
    }
    function checkCacheMatch(cacheFiles: FileListType[] | undefined, files: FileListType[] | undefined){
        if (!cacheFiles || !files) return false;
        const cacheFileNames = cacheFiles.map(f=>f.name).sort();
        const fileNames = files.map(f=>f.name).sort();
        return JSON.stringify(cacheFileNames) === JSON.stringify(fileNames);
    }
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
            notesHistory, 
            files, 
            setFiles, 
            activeSection, 
            setActiveSection, 
            topicWeights, 
            setTopicWeights, 
            metaObject,
            instructions,
            setInstructions,
            setCache,
            cache: cache ?? null,
        // Actions
            generateMeta, 
            generateNotes, 
            checkCacheMatch,
            isMetaLoading, 
            notesStatus,
            isEmbeddingImages,
            isCacheLoading,
            isNotesLoading: notesStatus == "streaming" || notesStatus == "submitted",
            isGenerating: isCacheLoading || isMetaLoading || notesStatus == "streaming" || notesStatus == "submitted",
            getActualNotes,
            stopGeneration, 
            ...value
        }}>
        {children}
    </NotebookContext.Provider>
}