import NotebookProvider from "@/components/providers/notebook-provider";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import getStoreFiles from "@/lib/file-search-actions/getStoreFiles";
import { notebook } from "@/lib/schemas/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {ReactNode} from "react";
export default async function DemoLayout({children, params}: {children: ReactNode, params: Promise<{id: string, noteId: string}>}){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        return redirect("/auth/log-in")
    }
    const {id, noteId} = await params;
    const raw = await db.query.notebook.findFirst({
        where: (notebook, {eq, and})=> and(eq(notebook.id, noteId), eq(notebook.userId, session.user.id), eq(notebook.classId, id)),
        with: {
            files: {
                with: {
                    file: true
                }
            }
        }
    })
    const data = raw ? { ...raw, files: raw.files.map(f => f.file) } : undefined
    if (!data){
        return redirect(`/dashboard/class/${id}/notebooks`)
    }
    const fileStoreFiles = (await getStoreFiles(data.fileStoreId!)).ids;
    return <NotebookProvider data={{ ...data, fileStoreFiles }}>
        {children}
    </NotebookProvider>
}