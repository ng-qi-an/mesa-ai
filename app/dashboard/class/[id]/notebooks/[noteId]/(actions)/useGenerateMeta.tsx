import { useNotebook } from "@/components/providers/notebook-provider";
import createCache from "@/lib/cache-actions/createCache";
import SaveToNotebook from "./saveToNotebook";

export function useGenerateMeta(){
    const { noteId, setNotesHistory, setTopicWeights, setIsCacheLoading, setCache, setCollapseSections, files, instructions, length, setInstructions, setLength, setMetaObject, metaSubmit } = useNotebook();

    async function generateMeta(customProps?: Record<string, any>){
        const customInstructions = customProps?.instructions ?? instructions;
        const customFiles: typeof files = customProps?.files ?? files;
        const customLength = customProps?.length ?? length;
        console.log("Generating topics with instructions:", customInstructions, "and files:", customFiles, "and length:", customLength);
        setMetaObject(undefined);
        setNotesHistory([]);
        setTopicWeights({});
        setIsCacheLoading(true);
        const newCache = await createCache(customFiles.map(f=>f.id), 900);
        if (!newCache || !newCache.name){
            console.error("Failed to create cache");
            setIsCacheLoading(false);
            return;
        }
        console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
        setCache(newCache.name!, customFiles.map(f=>f.id));
        await SaveToNotebook(noteId, {cache: {name: newCache.name!, fileIds: customFiles.map(f=>f.id)}});
        setIsCacheLoading(false);
        setCollapseSections(true);
        setInstructions(customInstructions);
        setLength(customLength);
        metaSubmit({
            cacheName: newCache.name!,
            instructions: customInstructions,
            length: customLength
        })
    }
    return { generateMeta };
}