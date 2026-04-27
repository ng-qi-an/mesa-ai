'use server';

import { generateObject } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';

export async function describeImage(imageBytes: Uint8Array, mimeType: string = 'image/jpeg'): Promise<string> {
    const imageBase64 = Buffer.from(imageBytes).toString('base64');
    const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

    const { object } = await generateObject({
        model: openrouter(process.env.RAG_VISION_MODEL || 'openai/gpt-4-vision'),
        system: 'You are an expert at analyzing and describing images for document indexing and search. Provide detailed, factual descriptions.',
        prompt: `Describe this image in detail for document indexing. Focus on content, data, diagrams, charts, tables, text, objects, and any relevant visual information.`,
        schema: z.object({
            description: z.string().describe('A detailed description of the image suitable for search indexing'),
        }),
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'image',
                        image: imageDataUrl,
                    },
                ],
            },
        ],
    });

    return object.description;
}
