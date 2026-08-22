import { db } from "@/lib/db";
import { r2 } from "@/lib/r2";
import { chatFiles, files } from "@/lib/schemas/schema";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ fileId: string, imageId: string }> }) {
    const { fileId, imageId } = await params;
    const file = (await db.select({images: files.images, userId: files.userId, id: files.id}).from(files).where(eq(files.id, fileId)))[0];
    if (!file){
        return new Response("File not found", { status: 404 });
    }
    if (!file.images){
        return new Response("No images found for this file", { status: 404 });
    }
    if (!file.images.find((image) => image.id === imageId)) {
        return new Response("Image not found for this file", { status: 404 });
    }

    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: `user-files/${file.userId}/${file.id}/${imageId}`,
    });
    const response = await r2.send(command);

    if (!response.Body) {
        return new Response("File body not found", { status: 404 });
    }

    const body = response.Body.transformToWebStream();
    const contentType = response.ContentType ?? "image/jpeg";
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