import { db } from "@/lib/db";
import { files } from "@/lib/schemas/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import NestPage from "./NestPage";

export default async function DrivePage({params}: {params: Promise<{nestIds: string[] | undefined, id: string}>}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) {
        return redirect("/login")
    }
    const {nestIds, id} = await params;
    const nests = nestIds ? (await db.select().from(files).where(inArray(files.id, nestIds))).sort((a, b) => nestIds.indexOf(a.id) - nestIds.indexOf(b.id)): [];
    
    if (nestIds && (nests.length == 0 || !nests.find((n)=> n.id == nestIds[nestIds.length - 1]))){
        return redirect(`/dashboard/class/${id}/drive`)
    }
    const userFiles = await db.select().from(files).where(and(eq(files.userId, session.user.id), eq(files.classId, id), nestIds ? eq(files.parentId, nestIds[nestIds.length - 1]) : isNull(files.parentId)));

    return <NestPage nests={nests} files={userFiles} revalidateData={async(pathname: string)=> {
        "use server";
        revalidatePath(pathname)
    }}/>
}