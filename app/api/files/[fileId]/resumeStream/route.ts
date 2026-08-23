import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { streamContext } from "@/lib/resumableStream";
import { files } from "@/lib/schemas/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
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

    if (file.status === "processed" || file.status === "error" || !file.streamId) {
        return sseOnce(file.status);
    }
    console.log("[RESUME STREAM] streamId:", file.streamId, typeof file.streamId);
    const stream = await streamContext.resumeExistingStream(file.streamId);
    if (!stream) return sseOnce(file.status);
    return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}

function sseOnce(status: string) {
    const enc = new TextEncoder();
    const body = new ReadableStream({
        start(c) {
            c.enqueue(enc.encode(`data: ${JSON.stringify({ status })}\n\n`));
            c.close();
        },
    });
    return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
}