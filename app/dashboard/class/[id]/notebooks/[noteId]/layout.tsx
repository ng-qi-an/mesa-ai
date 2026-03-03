import NotebookProvider from "@/components/providers/notebook-provider";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notebook } from "@/lib/schemas/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {ReactNode} from "react";
export default async function DemoLayout({children, params}: {children: ReactNode, params: Promise<{id: string, noteId: string}>}){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const {id, noteId} = await params;
    const raw = await db.query.notebook.findFirst({
        where: (notebook, {eq})=> eq(notebook.id, noteId),
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
    console.log("Notebook data:", data);
    return <NotebookProvider data={{
        ...data, 
        cache: data.cache ? {name: data.cache.name, fileIds: data.cache.fileIds} : null,
        instructions: data.instructions || "",
        topicWeights: data.topicWeights || {}
    }}>
        {children}
    </NotebookProvider>
}