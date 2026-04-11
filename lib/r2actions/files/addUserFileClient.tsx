'use client';

import addFilesToStore from "@/lib/file-search-actions/addFilesToStore";
import addUserFile2Db from "./addUserFile2Db";
import deleteUserFile from "./deleteUserFile";
import getFileStore from "@/lib/file-search-actions/getFileStore";

export default async function addUserFileClient(files: File[], urls: {url: string, id: string}[], parent: string, classId: string) {
    const store = await getFileStore({classId});
    if (!store || !store.name) {
        throw new Error("File store not found for class");
    }
    const uploadPromises = urls.map(async(url, index) => {
        try {
            console.log("== Start! Begin r2 upload for:", files[index].name, "==");
            const r = await fetch(url.url, {
                method: "PUT",
                body: files[index],
            });
            if (r.ok){
                try {
                    console.log("== Success! Begin DB upload: ==");
                    const res2 = await addUserFile2Db(url.id,files[index].name, files[index].type, parent, classId);
                    if (res2){
                        console.log("== Success! Begin filestore upload: ==");
                        await addFilesToStore([res2[0].id], store.name!);
                        console.log("== Success! Finished file upload process for:", files[index].name, "==");
                        return { name: files[index].name, status: "uploaded" };
                    } else {
                        throw new Error("Failed to add file to database after successful R2 upload");
                    }
                } catch (error) {
                    await deleteUserFile(url.id, parent);        
                    throw new Error(`Failed to upload file to DB`);
                }
            } else {
                throw new Error(`Failed to upload file to R2`);
            }
        } catch (error) {
            console.log("Error uploading file:", error);
            return { name: files[index].name, status: "failed" };
        }
    });
    return await Promise.all(uploadPromises);
}