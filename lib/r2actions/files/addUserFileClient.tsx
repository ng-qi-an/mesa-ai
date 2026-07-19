'use client';

import addUserFile2Db from "./addUserFile2Db";
import deleteUserFile from "./deleteUserFile";
import { ragFile } from "@/lib/rag-actions/ragFile";

export default async function addUserFileClient(files: File[], urls: {url: string, id: string}[], parent: string, classId: string) {
    const uploadPromises = urls.map(async(url, index) => {
        try {
            // Begin client side upload to R2 first.
            console.log("== Start! Begin r2 upload for:", files[index].name, "==");
            const r = await fetch(url.url, {
                method: "PUT",
                body: files[index],
            });
            if (r.ok){
                try {
                    // Add file to database
                    console.log("== Success! Begin DB insert: ==");
                    const res2 = await addUserFile2Db(url.id,files[index].name, files[index].type, parent, classId);
                    if (res2){
                        // Begin RAG parsing process
                        console.log("== Success! Begin rag parsing: ==");
                        await ragFile(res2[0].id, res2[0].contentType);
                        console.log("== Success! Finished rag parsing process for:", files[index].name, "==");
                        return { name: files[index].name, status: "uploaded" };
                    } else {
                        throw new Error("Failed to rag file to DB!");
                    }
                } catch (error) {
                    await deleteUserFile(url.id);        
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