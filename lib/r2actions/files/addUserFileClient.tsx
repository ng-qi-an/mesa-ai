'use client';

import addUserFile2Db from "./addUserFile2Db";
import deleteUserFile from "./deleteUserFile";

export default async function addUserFileClient(files: File[], urls: {url: string, id: string}[], parent: string, classId: string) {
    const uploadPromises = urls.map(async(url, index) => {
        console.log("Uploading file to R2:", files[index].name, "to URL:", url.url);
        try {
            const r = await fetch(url.url, {
                method: "PUT",
                body: files[index],
            });
            if (r.ok){
                try {
                    const res2 = await addUserFile2Db(url.id,files[index].name, files[index].type, parent, classId);
                    if (res2){
                        console.log("Successfully added file to database after R2 upload:", files[index].name);
                        return { name: files[index].name, status: "uploaded" };
                    }
                } catch (error) {
                    console.log("Error adding file to database after successful R2 upload:", error);
                    const res2 = await deleteUserFile(url.id, parent);
                    res2 > 0 && console.log("Deleted file from database after failed add, rolling back R2 upload:", files[index].name);
                    return { name: files[index].name, status: "failed" };
                }
            } else {
                console.log("Failed to upload file to R2:", r);
                return { name: files[index].name, status: "failed" };
            }
        } catch (error) {
            console.log("Error uploading file to R2:", error);
            return { name: files[index].name, status: "failed" };
        }
    });
    return await Promise.all(uploadPromises);
}