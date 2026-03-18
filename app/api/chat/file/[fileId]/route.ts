import { db } from "@/lib/db";
import { r2 } from "@/lib/r2";
import { chatFiles } from "@/lib/schemas/schema";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
    const { fileId } = await params;
    const file = (await db.select().from(chatFiles).where(eq(chatFiles.id, fileId)))[0];
    if (!file){
        return new Response("File not found", { status: 404 });
    }

    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: `user-files/${file.userId}/${file.id}`,
    });
    const response = await r2.send(command);

    if (!response.Body) {
        return new Response("File body not found", { status: 404 });
    }

    const body = response.Body.transformToWebStream();
    const contentType = response.ContentType ?? file.contentType ?? "application/octet-stream";
    const contentLength = response.ContentLength;
    const lastModified = response.LastModified?.toUTCString();
    const etag = response.ETag;
    const filename = encodeURIComponent(file.id);

    return new Response(body, {
        status: 200,
        headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Disposition": `inline; filename="${filename}"`,
            "Content-Type": contentType,
            ...(typeof contentLength === "number" ? { "Content-Length": String(contentLength) } : {}),
            ...(etag ? { ETag: etag } : {}),
            ...(lastModified ? { "Last-Modified": lastModified } : {}),
        },
    });
}