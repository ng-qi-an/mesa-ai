'use server';
import { headers } from "next/headers";
import { auth } from "../auth";
import { r2 } from "../r2";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";



export type FileListType =  {
    name: string;
    size: number;
    status: "uploaded" | "failed" | "pending";
    lastModified: Date;
}

export default async function getUserFiles(){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME!,
        Prefix: `user-files/${session.user.id!}/`,
        Delimiter: '/',
    })
    const response = await r2.send(command);
    return response.Contents?.map((content)=>{
        return {
            name: content.Key?.replace(`user-files/${session.user.id!}/`, '') || '',
            size: content.Size || 0,
            lastModified: content.LastModified,
            status: 'uploaded'
        }
    }) as FileListType[] || [];
}