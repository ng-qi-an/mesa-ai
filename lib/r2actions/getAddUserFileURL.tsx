'use server';
import { headers } from "next/headers";
import { auth } from "../auth";
import { r2 } from "../r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type PartialFileType = {
    name: string;
    type: string;
}

export default async function getAddUserFileURL(files: PartialFileType[]){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    console.log("Generating signed URLs for user:", session.user.id);
    console.log("Files to upload:", files);
    const promises = files.map(async(file) => {
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: `user-files/${session!.user.id!}/${file.name}`,
            ContentType: file.type,
        })
        return await getSignedUrl(r2, command, { expiresIn: 60 * 15 });
    });
    return await Promise.all(promises);
}