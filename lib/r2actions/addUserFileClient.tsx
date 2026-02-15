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
        console.log("Uploading file to R2:", originalFiles[index].name, "to URL:", url);
        try {
            const r = await fetch(url, {
                method: "PUT",
                body: originalFiles[index],
            });
            if (!r.ok){
                const payload: FileListType = { ...uploadedFiles[index], status: "failed" };
                setFiles((x) => x.map((f, i) => {
                    if (f.name === originalFiles[index].name){
                        return payload;
                    }
                    return f;
                }));
                console.log("Failed to upload file to R2:", r);
                return payload;
            } else {
                console.log("Successfully uploaded file to R2:", originalFiles[index].name);
                const payload: FileListType = { ...uploadedFiles[index], status: "uploaded" };
                setFiles((x) => x.map((f, i) => {
                    if (f.name === originalFiles[index].name){
                        return payload;
                    }
                    return f;
                }));
                return payload;
            }
            
        } catch (error) {
            console.log("Error uploading file to R2:", error);
                const payload: FileListType = { ...uploadedFiles[index], status: "failed" };
            setFiles((x) => x.map((f, i) => {
                if (f.name === originalFiles[index].name){
                    return payload;
                }
                return f;
            }));
            return payload
        }
    });
    return await Promise.all(uploadPromises);
}