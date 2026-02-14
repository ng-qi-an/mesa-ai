'use server';
import { headers } from "next/headers";
import { auth } from "../auth";
import { r2 } from "../r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export default async function getUserFile(key: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: `user-files/${session.user.id}/${key}`,
    })
    const response = await r2.send(command);
    const byteArray = await response.Body?.transformToByteArray();
    return {...response, data: byteArray};
}