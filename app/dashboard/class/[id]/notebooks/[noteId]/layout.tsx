import NotebookProvider from "@/components/providers/notebook-provider";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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
                    file: {
                        columns: {id: true, name: true, contentType: true}
                    }
                }
            }
        }
    })
    const data = raw ? { ...raw, files: raw.files.map(f => f.file) } : undefined
    if (!data){
        return redirect(`/dashboard/class/${id}/notebooks`)
    }
    return <NotebookProvider data={{ ...data }}>
        {children}
    </NotebookProvider>
}