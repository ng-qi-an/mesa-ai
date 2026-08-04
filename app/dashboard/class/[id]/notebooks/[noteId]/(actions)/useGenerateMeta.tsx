import { useClass } from "@/components/providers/class-provider";
import { useNotebook } from "@/components/providers/notebook-provider";
import SaveToNotebook from "./saveToNotebook";

export function useGenerateMeta(){
    const { noteId, setNotesHistory, setTopicWeights, setCollapseSections, files, instructions, length, setSourceFiles, setIsStoringFiles, setInstructions, setLength, setMetaObject, metaSubmit, setBlocks } = useNotebook();
    async function generateMeta(customProps?: Record<string, any>){
        const customInstructions = customProps?.instructions ?? instructions;
        const customFiles: typeof files = customProps?.files ?? files;
        const customLength = customProps?.length ?? length;
        setIsStoringFiles(true);
        console.log("Generating topics with instructions:", customInstructions, "and files:", customFiles, "and length:", customLength);
        setMetaObject(undefined);
        setBlocks([]);
        setNotesHistory([]);
        setTopicWeights({});
        setSourceFiles(customFiles.map(f => f.id));
        await SaveToNotebook(noteId, {sourceFiles: customFiles.map(f => f.id)});
        setIsStoringFiles(false);
        setCollapseSections(true);
        setInstructions(customInstructions);
        setLength(customLength);
        metaSubmit({
            instructions: customInstructions,
            length: customLength,
            id: noteId,
        })
    }
    return { generateMeta };
}