export default function checkFileStoreMatch(sourceFiles: string[] | undefined, fileIds: string[] | undefined){
    if (!sourceFiles || !fileIds) return false;
    console.log("Source files:", sourceFiles);
    console.log("File IDs:", fileIds);
    return JSON.stringify(sourceFiles.sort()) === JSON.stringify(fileIds.sort());
}