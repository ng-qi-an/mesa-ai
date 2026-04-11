export default function checkFileStoreMatch(notebookFiles: string[] | undefined, fileIds: string[] | undefined){
    if (!notebookFiles || !fileIds) return false;
    console.log("notebookFiles files:", notebookFiles);
    console.log("notebookFiles IDs:", fileIds);
    return JSON.stringify(notebookFiles.sort()) === JSON.stringify(fileIds.sort());
}