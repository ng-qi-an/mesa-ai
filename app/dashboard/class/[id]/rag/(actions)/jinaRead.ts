'use server';

import getDownloadFileUrl from "@/lib/r2actions/files/getDownloadFileUrl";

export default async function jinaRead(fileId: string){
    console.log("Reading file with ID:", fileId);
    const fileUrl = await getDownloadFileUrl(fileId);
    return `https://r.jina.ai/${fileUrl}`
}