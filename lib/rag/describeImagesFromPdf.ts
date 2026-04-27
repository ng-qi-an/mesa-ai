'use server';

import { PDFParse } from 'pdf-parse';
import { describeImage } from './describeImage';

async function extractImagesFromPdf(bytes: Uint8Array): Promise<string[]> {
    const descriptions: string[] = [];

    try {
        const parser = new PDFParse({ data: Buffer.from(bytes) });
        const result = await parser.getImage({ imageThreshold: 50 });
        await parser.destroy();

        if (!result.pages) {
            console.debug('No pages found in PDF');
            return descriptions;
        }

        // Process images from each page
        for (const page of result.pages) {
            if (!page.images || page.images.length === 0) continue;

            for (const image of page.images) {
                try {
                    if (image.data) {
                        const description = await describeImage(image.data);
                        descriptions.push(description);
                    }
                } catch (err) {
                    console.debug('Failed to describe image:', err);
                }
            }
        }
    } catch (err) {
        console.warn('PDF image extraction encountered an issue:', err);
    }

    return descriptions;
}

export async function extractImagesDescriptionsFromPdf(bytes: Uint8Array): Promise<string> {
    const descriptions = await extractImagesFromPdf(bytes);
    
    if (descriptions.length === 0) {
        return '';
    }

    return (
        '\n\n--- Images in Document ---\n' +
        descriptions.map((desc, idx) => `Image ${idx + 1}:\n${desc}`).join('\n\n')
    );
}
