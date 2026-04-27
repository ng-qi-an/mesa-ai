import { getPath, getData } from 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';
import { extractImagesDescriptionsFromPdf } from './describeImagesFromPdf';
import { describeImage } from './describeImage';

PDFParse.setWorker(getPath());

type ExtractTextParams = {
    bytes: Uint8Array;
    contentType?: string | null;
};

function decodeUtf8(bytes: Uint8Array): string {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export async function extractTextFromFile({ bytes, contentType }: ExtractTextParams): Promise<string> {
    const normalizedType = (contentType ?? "").toLowerCase();

    // Handle image uploads (JPEG, PNG, WebP, GIF)
    if (normalizedType.includes("image/")) {
        try {
            const description = await describeImage(bytes, normalizedType);
            return description.trim();
        } catch (err) {
            console.warn("Failed to describe image, using fallback:", err);
            return "Unable to process image";
        }
    }

    if (normalizedType.includes("pdf")) {
        const parser = new PDFParse({data: Buffer.from(bytes)});
        const text = (await parser.getText()).text ?? "";
        
        // Extract and describe images from PDF
        let imageDescriptions = "";
        try {
            imageDescriptions = await extractImagesDescriptionsFromPdf(bytes);
        } catch (err) {
            console.warn("Failed to extract images from PDF, continuing with text only:", err);
        }
        
        return (text + imageDescriptions).trim();
    }

    if (
        normalizedType.startsWith("text/") ||
        normalizedType.includes("json") ||
        normalizedType.includes("xml") ||
        normalizedType.includes("javascript") ||
        normalizedType.includes("typescript")
    ) {
        return decodeUtf8(bytes).trim();
    }

    // Fallback for unknown content-types; this keeps indexing resilient for lightly-structured files.
    return decodeUtf8(bytes).replace(/\u0000/g, "").trim();
}
