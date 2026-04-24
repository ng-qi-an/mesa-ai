'use server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function setPassword(newPassword: string){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Not authenticated");
    };
    const user = session.user;
    await auth.api.setPassword({
        body: {
            newPassword
        },
        headers: await headers()
    })
}