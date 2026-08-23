import { generateText } from "ai";
import getDownloadFileUrl from "../r2actions/files/getDownloadFileUrl";
import { allowedFileTypes } from "../utils";
import { getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import sharp from "sharp";
import { summaryModels } from "../utils/models";
import constructProvider from "../utils/constructProvider";
import { generateId } from "better-auth";
import { r2 } from "../r2";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "../db";
import { files } from "../schemas/schema";
import { and, eq } from "drizzle-orm";
import { createHash } from "node:crypto";

const MAX_IMAGE_DIMENSION = 1600;
const MIN_IMAGE_DIMENSION = 200;
const MAX_DECODED_IMAGE_SIZE = 16_777_216;
const DOCUMENT_INFO_TIMEOUT_MS = 30_000;
const PAGE_IMAGE_EXTRACTION_TIMEOUT_MS = 5_000;
const PARSER_CLEANUP_TIMEOUT_MS = 5_000;

// Use the inlined worker source so Next/Turbopack does not need to resolve a
// separate pdf.worker.mjs file from its generated server chunks.
PDFParse.setWorker(getData());

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(message)), timeoutMs);

        promise.then(
            (value) => {
                clearTimeout(timeout);
                resolve(value);
            },
            (error) => {
                clearTimeout(timeout);
                reject(error);
            },
        );
    });
}

export default async function extractImages({contentType, fileId, userId}: {contentType: string, fileId: string, userId: string}) {
    if (!allowedFileTypes.documents.includes(contentType) || contentType !== "application/pdf") {
        throw new Error(`Embedded image extraction is not supported for ${contentType}`);
    }
    const oldFiles = (await db.select({images: files.images}).from(files).where(and(eq(files.id, fileId), eq(files.userId, userId))))[0];
    if (oldFiles.images && oldFiles.images.length > 0) {
        const command = new DeleteObjectsCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Delete: {
                Objects: oldFiles.images.map((image) => ({ Key: `user-files/${userId}/${fileId}/${image.id}` })),
            },
        });
        await r2.send(command);
    }

    const fileUrl = await getDownloadFileUrl(fileId);
    console.log("[Extract Image] Got download url:", fileUrl);
    let parser = new PDFParse({
        url: fileUrl,
        maxImageSize: MAX_DECODED_IMAGE_SIZE,
    });
    console.log("[Extract Image] Parser created");
    let images: Uint8Array[] = [];
    try {
        console.log("[Extract Image] Reading PDF page count");
        const info = await withTimeout(
            parser.getInfo(),
            DOCUMENT_INFO_TIMEOUT_MS,
            `Reading PDF metadata timed out after ${DOCUMENT_INFO_TIMEOUT_MS / 1000}s`,
        );
        console.log(`[Extract Image] PDF contains ${info.total} pages`);
        const uniqueImages = new Map<string, Uint8Array>();
        for (let pageNumber = 1; pageNumber <= info.total; pageNumber++) {
            if (uniqueImages.size >= 30) {
                console.log("Reached maximum number of unique images (30), skipping remaining pages.");
                break;
            }

            try {
                console.log(`[Extract Image] Decoding images on page ${pageNumber}/${info.total}`);
                const result = await withTimeout(
                    parser.getImage({
                        partial: [pageNumber],
                        imageBuffer: true,
                        imageDataUrl: false,
                        imageThreshold: MIN_IMAGE_DIMENSION,
                    }),
                    PAGE_IMAGE_EXTRACTION_TIMEOUT_MS,
                    `Image extraction timed out on page ${pageNumber} after ${PAGE_IMAGE_EXTRACTION_TIMEOUT_MS / 1000}s`,
                );

                for (const page of result.pages) {
                    for (const image of page.images) {
                        console.log("Processing image with dimensions:", image.width, "x", image.height);
                        if (
                            !image.data?.length ||
                            image.width <= MIN_IMAGE_DIMENSION ||
                            image.height <= MIN_IMAGE_DIMENSION
                        ) {
                            continue;
                        }
                        if (uniqueImages.size >= 30) {
                            break;
                        }
                        const compressed = await sharp(Buffer.from(image.data))
                            .resize({
                                width: MAX_IMAGE_DIMENSION,
                                height: MAX_IMAGE_DIMENSION,
                                fit: "inside",
                                withoutEnlargement: true,
                            })
                            .flatten({ background: "#ffffff" })
                            .jpeg({
                                quality: 85,
                                progressive: true,
                                mozjpeg: true,
                                chromaSubsampling: "4:4:4",
                            })
                            .toBuffer();
                        const compressedImage = new Uint8Array(compressed);
                        const imageHash = createHash("sha256")
                            .update(compressedImage)
                            .digest("hex");

                        uniqueImages.set(imageHash, compressedImage);
                    }
                }
            } catch (error) {
                console.warn(`[Extract Image] Skipping page ${pageNumber}:`, error);

                try {
                    await withTimeout(
                        parser.destroy(),
                        PARSER_CLEANUP_TIMEOUT_MS,
                        `PDF parser cleanup timed out after ${PARSER_CLEANUP_TIMEOUT_MS / 1000}s`,
                    );
                } catch (cleanupError) {
                    console.warn("[Extract Image] Failed to reset PDF parser:", cleanupError);
                }

                parser = new PDFParse({
                    url: fileUrl,
                    maxImageSize: MAX_DECODED_IMAGE_SIZE,
                });
            }
        }
        images = [...uniqueImages.values()];
    } finally {
        try {
            await withTimeout(
                parser.destroy(),
                PARSER_CLEANUP_TIMEOUT_MS,
                `PDF parser cleanup timed out after ${PARSER_CLEANUP_TIMEOUT_MS / 1000}s`,
            );
        } catch (error) {
            console.warn("[Extract Image] Failed to clean up PDF parser:", error);
        }
    }
    console.log("Detected", images.length, "unique images in PDF file", fileId);
    const imageSummaries = await Promise.all(images.map(async (image) => {
        const imageId = generateId(16);
        await r2.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: `user-files/${userId}/${fileId}/${imageId}`,
                Body: image,
                ContentType: "image/jpeg",
                ContentLength: image.byteLength,
            }),
        );
        const response = await generateText({
            model: constructProvider(summaryModels[0]).chat(summaryModels[0].name),
            messages: [{
                role: "user",
                content: [
                {
                    type: "text",
                    text: "Provide a concise summary of the content of this image. Describe what is depicted in the image, including any relevant details such as numbers, context, or objects present. The summary should be a paragraph under 40 words."
                },
                {
                    type: 'file',
                    data: image,
                    mediaType: "image/jpeg"
                }
                ]
            }],
            providerOptions: {
                openrouter: {
                models: summaryModels.map((model) => model.name),
                route: "fallback",
                }
            },
        });
        if (!response.text) {
            throw new Error("No text returned from image description generation");
        }
        console.log(`🖼️ Generated image summary for file ${fileId}, image ${imageId}:`, response.text);

        return { summary: response.text, id: imageId };
    }));
    console.log(`🖼️ Extracted and summarized ${imageSummaries.filter((v)=> v.summary).length} images for file ${fileId}`);
    return imageSummaries;
}
