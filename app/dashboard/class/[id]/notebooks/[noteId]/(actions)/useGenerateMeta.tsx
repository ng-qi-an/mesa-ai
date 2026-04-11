import { useClass } from "@/components/providers/class-provider";
import { useNotebook } from "@/components/providers/notebook-provider";
import SaveToNotebook from "./saveToNotebook";

export function useGenerateMeta(){
    const { noteId, setNotesHistory, setTopicWeights, setCollapseSections, files, instructions, length, setSourceFiles, setIsStoringFiles, setInstructions, setLength, setMetaObject, metaSubmit } = useNotebook();
    const { _class: {fileStoreId} } = useClass();
    async function generateMeta(customProps?: Record<string, any>){
        const customInstructions = customProps?.instructions ?? instructions;
        const customFiles: typeof files = customProps?.files ?? files;
        const customLength = customProps?.length ?? length;
        setIsStoringFiles(true);
        console.log("Generating topics with instructions:", customInstructions, "and files:", customFiles, "and length:", customLength);
        setMetaObject(undefined);
        setNotesHistory([]);
        setTopicWeights({});
        if (!fileStoreId){
            throw new Error("No file store ID found for this class");
        }
        setSourceFiles(customFiles.map(f => f.id));
        await SaveToNotebook(noteId, {sourceFiles: customFiles.map(f => f.id)});
        setIsStoringFiles(false);
        // Can be skipped since filestore is now managed by class
        // // Updating the filestoreee!
        // setIsStoringFiles(true);
        // const customFileIds = customFiles.map(f => f.id);
        // const fileStoreFileIds = [...new Set(fileStoreFiles)];
        // console.log("Current file store files:", fileStoreFileIds);
        // console.log("Custom files for meta generation:", customFileIds);
        // const filesToAdd:string[] = []
        // const filesToRemove:string[] = []
        // customFiles.forEach((file) => {
        //     if (!fileStoreFileIds.includes(file.id)){
        //         filesToAdd.push(file.id);
        //     }
        // })
        // fileStoreFileIds.forEach((fileId) => {
        //     if (!customFileIds.includes(fileId)){
        //         filesToRemove.push(fileId);
        //     }
        // }) 
        // console.log("Files to add to store:", filesToAdd);
        // console.log("Files to remove from store:", filesToRemove);
        // try {
        //     console.log("[gen meta] Adding", filesToAdd.length, "files to store")
        //     let result = null;
        //     if (filesToAdd.length > 0) {
        //         result = await addFilesToStore(filesToAdd, fileStoreId!);
        //     }
        //     console.log("[gen meta] Removing", filesToRemove.length, "files from store")
        //     if (filesToRemove.length > 0){
        //         result = await deleteStoreFiles(fileStoreId!, filesToRemove)
        //     }
        //     if (result){
        //         setFileStoreFiles(result)
        //     }
        //     setIsStoringFiles(false);
        // } catch (error) {
        //     console.error("[gen meta] Error adding files to store:", error);
        //     setIsStoringFiles(false);
        //     return;
        // }
        setCollapseSections(true);
        setInstructions(customInstructions);
        setLength(customLength);
        metaSubmit({
            fileStoreId: fileStoreId!,
            instructions: customInstructions,
            length: customLength,
            fileIds: customFiles.map(f=>f.id),
        })
    }
    return { generateMeta };
}