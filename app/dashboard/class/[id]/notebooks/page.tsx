import { auth } from "@/lib/auth";
import NotebookPage from "./NotebookPage";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { notebook } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Page({params}: {params: Promise<{id: string}>}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })    
    if (!session || !session.user) {
        return redirect("/auth/log-in")
    }
    const { id } = await params;
    const data = (await db.select().from(notebook).where(and(eq(notebook.userId, session.user.id), eq(notebook.classId, id)))).sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());
    return <NotebookPage notebooks={data} />
}