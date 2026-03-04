import { useNotebook } from "@/components/providers/notebook-provider";
import createCache from "@/lib/cache-actions/createCache";
import SaveToNotebook from "./saveToNotebook";

export function useGenerateMeta(){
    const { noteId, setNotesHistory, setTopicWeights, setIsCacheLoading, setCache, setCollapseSections, files, instructions, metaClear, metaSubmit } = useNotebook();

    async function generateMeta(customProps?: Record<string, any>){
        const customInstructions = customProps?.instructions || instructions;
        const customFiles = customProps?.files || files;
        console.log("Generating topics with instructions:", customInstructions || instructions, "and files:", customFiles || files);
        setNotesHistory([]);
        setTopicWeights({});
        setIsCacheLoading(true);
        const newCache = await createCache(files.map(f=>f.id), 900);
        if (!newCache || !newCache.name){
            console.error("Failed to create cache");
            setIsCacheLoading(false);
            return;
        }
        console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
        setCache(newCache.name!, files.map(f=>f.id));
        await SaveToNotebook(noteId, {cache: {name: newCache.name!, fileIds: files.map(f=>f.id)}});
        setIsCacheLoading(false);
        setCollapseSections(true);
        metaClear();
        metaSubmit({
            cacheName: newCache.name!,
            instructions: instructions
        })
    }
    return { generateMeta };
}