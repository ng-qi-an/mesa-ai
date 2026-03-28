export default function checkFileStoreMatch(fileStoreFiles: string[] | undefined, fileIds: string[] | undefined){
    if (!fileStoreFiles || !fileIds) return false;
    console.log("File store files:", fileStoreFiles);
    console.log("Custom file IDs:", fileIds);
    return JSON.stringify(fileStoreFiles.sort()) === JSON.stringify(fileIds.sort());
}