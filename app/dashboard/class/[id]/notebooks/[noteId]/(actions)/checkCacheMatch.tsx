
export default function checkCacheMatch(cacheFileIds: string[] | undefined, fileIds: string[] | undefined){
    if (!cacheFileIds || !fileIds) return false;
    const cacheFileNames = cacheFileIds.sort();
    const fileNames = fileIds.sort();
    return JSON.stringify(cacheFileNames) === JSON.stringify(fileNames);
}