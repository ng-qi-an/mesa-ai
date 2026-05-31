'use server';
import { headers } from "next/headers";
import { auth } from "../../auth";
import { r2 } from "../../r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateId } from "better-auth";


export default async function getDownloadFileUrl(fileId: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: `user-files/${session!.user.id!}/${fileId}`,
    })
    return await getSignedUrl(r2, command, { expiresIn: 60 * 15 })
}