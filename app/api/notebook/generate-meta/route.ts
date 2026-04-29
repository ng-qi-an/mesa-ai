import { streamText, Output } from 'ai';
import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { noteMetaSchema } from '../schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { fileSearchMetaQuery } from '@/lib/utils/models';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    fileStoreId: string;
    fileIds: string[];
    instructions: string;
    length: string;
}

export async function POST(req: Request) {
    const context: NotebookRequestType = await req.json();
    
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    if (!context.fileStoreId) {
        throw new Error("File store ID is required");
    }
    if (!context.fileIds || context.fileIds.length === 0) {
        throw new Error("At least one file ID is required");
    }

    const result = streamText({
        model: google("gemini-3-flash-preview"), // "google/gemini-3-flash-preview",
        output: Output.object({ schema: noteMetaSchema }),
        tools: {
            file_search: google.tools.fileSearch({fileSearchStoreNames: [context.fileStoreId], metadataFilter: fileSearchMetaQuery(context.fileIds)}),
        },
        system: `
        ## Output Guidelines
            ### Topic Naming Rules
            - Use noun phrases or short descriptive titles
            - Be specific: "Mitigation Strategies" not "Strategies"
            - Match the terminology used in the source
            - Avoid generic names like "Introduction" or "Overview" unless truly distinct sections
            
        ## Examples
                Source about economics:
                - Title: "Macroeconomic Policy Fundamentals"
                - Topics: ["Fiscal Policy Apps", "Monetary Policy Mechanisms", "Inflation and Unemployment", "International Trade Effects"]
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
            - Example: A document only about photosynthesis → ["Light-Dependent Reactions", "Calvin Cycle", "Factors Affecting Rate", "Photosynthesis in Ecosystems"]`,
        prompt: `
        ## Instructions
        You must use the file sources strictly as references to generate the topic names. Do not use any outside knowledge or assumptions. The topics should be directly supported by the content in the file sources. If a topic cannot be supported by the file sources, do not include it in the output.
        As the user wants ${context.length} notes, generate ${
            context.length == "concise" ? "2-4 high-level topics that capture the key points of a source such that a brief summary can be made for readers with some prior knowledge."
            : context.length == "detailed" ? "8-12 specific topics that cover every aspects of the source, enabling a comprehensive set of notes for readers with no prior knowledge."
            : "5-8 balanced topics that cover the main themes and some specific details of the source, allowing for moderately detailed notes for readers with some prior knowledge."
        }    
        In addition, the user provided the following instructions to guide your topic generation: ${context.instructions}`,
        providerOptions: {
            google: {
                thinkingConfig: {
                    thinkingLevel: "minimal",
                    // thinkingBudget: 0
                },
            } satisfies GoogleGenerativeAIProviderOptions
        }
    });
    return result.toTextStreamResponse();
}