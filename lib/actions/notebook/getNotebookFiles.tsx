import { auth } from "@/lib/auth";
import { db } from "@/lib/db"
import { FileSelect } from "@/lib/schemas/schema";
import { headers } from "next/headers";

export default async function getNotebookFiles(noteId: string, getMarkdown: boolean = false): Promise<FileSelect[]> {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session|| !session.user) {
        throw new Error("Unauthorized")
    }
    const raw = await db.query.notebook.findFirst({
        where: (notebook, {eq, and})=> and(eq(notebook.id, noteId), eq(notebook.userId, session.user.id)),
        with: {
            files: {
                with: {
                    file: {
                        columns: {id: true, name: true, contentType: true, dateModified: true, dateCreated: true, markdown: getMarkdown}
                    }
                }
            }
        }
    })
    if (!raw){
        throw new Error("Notebook not found")
    }
    return raw.files.map(f => f.file as FileSelect)
}