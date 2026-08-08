import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { streamContext } from "@/lib/resumableStream";
import { files } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
    const { fileId } = await params;
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    const fileList = await db.select().from(files).where(and(eq(files.userId, session.user.id), eq(files.id, fileId)));
    if (fileList.length === 0) {
        throw new Error("File not found");
    }
    const file = fileList[0];
    if (file.status == "processed"){
        throw new Error("File already processed");
    }
      const streamId = file.status === "processing" && file.streamId ? file.streamId : "process-file-"+generateId();

    if (file.status !== "processing") {
        await db.update(files).set({ status: "processing", streamId: streamId }).where(eq(files.id, fileId));
    }
    const stream = await streamContext.createNewResumableStream(streamId, () => makeProcessingStream(fileId));
    return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
}