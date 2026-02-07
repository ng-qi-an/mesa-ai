'use client';
import { FileListType } from "./getUserFiles";

export default async function addUserFileClient(originalFiles: File[], urls: string[], setFiles: (files: FileListType[] | ((files: FileListType[]) => FileListType[])) => void) {
    const uploadedFiles: FileListType[] = await Promise.all(originalFiles.map(async(file) => ({
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        status: "pending"
    })));
    setFiles((x)=> [...x, ...uploadedFiles]);
    const uploadPromises = urls.map(async(url, index) => {
        try {
            const r = await fetch(url, {
                method: "PUT",
                body: originalFiles[index],
            });
            if (!r.ok){
                setFiles((x) => x.map((f, i) => {
                    if (f.name === originalFiles[index].name){
                        return { ...f, status: "failed" };
                    }
                    return f;
                }));
                console.log("Failed to upload file to R2:", r);
            } else {
                console.log("Successfully uploaded file to R2:", originalFiles[index].name);
                setFiles((x) => x.map((f, i) => {
                    if (f.name === originalFiles[index].name){
                        return { ...f, status: "uploaded" };
                    }
                    return f;
                }));
            }
            
        } catch (error) {
            console.log("Error uploading file to R2:", error);
            setFiles((x) => x.map((f, i) => {
                if (f.name === originalFiles[index].name){
                    return { ...f, status: "failed" };
                }
                return f;
            }));
        }
    });
    await Promise.all(uploadPromises);
    return true;
}