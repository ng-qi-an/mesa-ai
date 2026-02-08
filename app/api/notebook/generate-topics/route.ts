import { streamText, Output, generateText } from 'ai';
import { google } from "@ai-sdk/google";
import { noteTopicSchema } from '../schema';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '@/lib/r2';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    files: string[];
    instructions: string;
}

export async function POST(req: Request) {
    const context: NotebookRequestType = await req.json();
    
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }

    if (!context.files || context.files.length === 0) {
        throw new Error("No files provided");
    }

    console.log("Received files: ", context.files);

    const filesMap = context.files.map(async(fileKey) => {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: `user-files/${session.user.id}/${fileKey}`,
        })
        const response = await r2.send(command);
        const byteArray = await response.Body?.transformToByteArray();
        if (!byteArray || !response.ContentType) {
            throw new Error(`Failed to load file: ${fileKey}`);
        }
        const data = {
            type: "file" as const,
            mediaType: response.ContentType,
            filename: fileKey.split('/').pop() || 'file',
            data: byteArray
        }
        return data
    });
    const files = await Promise.all(filesMap);

    const result = streamText({
        model: google("gemini-3-flash-preview"),
        output: Output.object({ schema: noteTopicSchema }),
        messages: [
            {
                role: "system",
                content: `
                ## Output Guidelines
                    ### Topic Naming Rules
                    - Use noun phrases or short descriptive titles
                    - Be specific: "Mitigation Strategies" not "Strategies"
                    - Match the terminology used in the source
                    - Avoid generic names like "Introduction" or "Overview" unless truly distinct sections
                    
                ## Examples
                        Source about economics:
                        - Title: "Macroeconomic Policy Fundamentals"
                        - Topics: ["Fiscal Policy Tools", "Monetary Policy Mechanisms", "Inflation and Unemployment", "International Trade Effects"]
                        Source about biology:
                        - Title: "Cell Division and Reproduction"  
                        - Topics: ["Mitosis Process", "Meiosis and Genetic Variation", "Cell Cycle Regulation", "Chromosomal Abnormalities"]
                        Source about history:
                        - Title: "Causes of World War I"
                        - Topics: ["Alliance Systems in Europe", "Imperial Rivalries", "Nationalism and Militarism", "The Assassination Trigger"]
                
                ## Edge Cases
                    ### If the document has clear section headers:
                    - Use them as a starting point, but consolidate if there are too many
                    - Rename if headers are vague or overly long
                    ### If the document is unstructured:
                    - Identify recurring themes and concepts
                    - Group related ideas into logical topics
                    ### If topics overlap significantly:
                    - Merge into a broader topic
                    - Prefer fewer, well-defined topics over many overlapping ones
                    ### If the document covers one narrow subject:
                    - Break down into subtopics or aspects
                    - Example: A document only about photosynthesis → ["Light-Dependent Reactions", "Calvin Cycle", "Factors Affecting Rate", "Photosynthesis in Ecosystems"]
                `
            },
            {
                role: "user",
                content: [
                    { 
                        type: "text",
                        text:"Use the provided documents as sources for generation."
                    },
                    ...files
                ]
            }
        ],
        providerOptions: {
            google: {
                thinkingConfig: {
                    thinkingLevel: "low",
                }
            }
        }
    });
    return result.toTextStreamResponse();
}