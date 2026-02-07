'use server';
import { headers } from "next/headers";
import { auth } from "../auth";
import { r2 } from "../r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export default async function deleteUserFiles(fileNames: string[]){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    const promises = fileNames.map(async(fileName) => {
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: `user-files/${session.user.id!}/${fileName}`,
        })
        try {
            await r2.send(command);
            return {name: fileName, success: true};
        } catch (error) {
            console.log(`Error deleting file ${fileName} from R2: ${error}`);
            return {name: fileName, success: false, error: error};
        }
    })
    return await Promise.all(promises);
}