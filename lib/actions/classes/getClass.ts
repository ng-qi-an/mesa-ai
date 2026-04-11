'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import getFileStore from "@/lib/file-search-actions/getFileStore";
import getStoreFiles from "@/lib/file-search-actions/getStoreFiles";
import { headers } from "next/headers";

export default async function getClassServer(classId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    const _class =  await db.query.classes.findFirst({
        where: (classes, { and, eq }) => and(eq(classes.userId, session.user.id), eq(classes.id, classId)),
        with: {
            topics: true
        }
    })
    console.log("poops")
    const filestore = await getFileStore({fileStoreId: _class?.fileStoreId!})
    console.log("filestore files:", ((await getStoreFiles(filestore.name!))).raw.map(f => ({name: f.name, displayName: f.displayName, meta: JSON.stringify(f.customMetadata)})))
    return _class;
    //return (await db.select().from(classes).where(and(eq(classes.userId, session.user.id), eq(classes.id, classId))))[0];
}