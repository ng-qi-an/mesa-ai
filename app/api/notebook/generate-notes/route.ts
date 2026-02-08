import { streamText, Output } from 'ai';
import { google } from "@ai-sdk/google";
import { noteSchema } from '../schema';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '@/lib/r2';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    topicWeights?: Record<string, number>;
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
    if (!context.topicWeights){
        throw new Error("Missing topic weights");
    }
    const topicWeights = context.topicWeights!

    const imageUrls: {url: string, description: string}[] = []

    if (!context.files || context.files.length === 0) {
        throw new Error("No files provided");
    }
    console.log("Received files: ", context.files);

    // Retrieves the files and converts them into file parts
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


    console.log("Using topic weights:", topicWeights);
    console.log("Generating notes for user:", session.user.id);

    const result = streamText({
        model: google("gemini-3-flash-preview"),
        output: Output.object({ schema: noteSchema }),
        messages: [
            {
                role: "system",
                content: `
                ## Formatting Rules
                    ### Headings
                    - NEVER use H1 (#) — the title serves as the document header
                    - Use H2 (##) for main topic sections
                    - Use H3 (###) for subtopics within sections
                    - Use H4 (####) sparingly for detailed breakdowns
                    ### Images
                    When a list of image URLs are provided, embed them meaningfully:
                    - Place images after introducing a concept they illustrate
                    - Use descriptive alt text: ![Diagram showing the water cycle stages](url)
                    - Don't cluster images — spread them throughout the content
                    - If no images are provided, continue without them
                    ### Text Formatting
                    - **Bold** for key terms and vocabulary
                    - *Italics* for definitions and emphasis
                    - Use > blockquotes for important formulas, quotes, or critical points
                    - Use \`inline code\` for technical terms, commands, or notation
                    ### Lists
                    - Bullet points for unordered information (features, characteristics)
                    - Numbered lists for sequences, steps, or ranked items
                    - Keep list items concise — expand in paragraphs if needed

                ## Content Guidelines
                    ### Length & Readability
                    - Target 1500-2000 words (readable in 10-15 minutes)
                    - Allocate word count proportionally to topic weight percentages
                    - A topic with 40% weight should receive ~40% of the content depth
                    ### Writing Style
                    - Explain concepts, don't just restate the source
                    - Use analogies for complex ideas
                    - Write for understanding, not just memorization
                    - Active voice preferred
                    ### Structure Each Topic Section
                    1. Brief intro (what is this and why does it matter?)
                    2. Core explanation with examples
                    3. Key relationships or comparisons
                    4. Common misconceptions if relevant
                    ### Always End With
                    A "Key Takeaways" section containing 3-5 bullet points summarizing the most important concepts.
                
                ## Edge Case Handling
                    ### If the document is very short:
                    - Focus on depth over breadth
                    - Add contextual explanations the source may assume
                    - Still respect topic weight ratios
                    ### If the document is very long:
                    - Prioritize concepts matching the weighted topics
                    - Summarize tangential information briefly
                    - Maintain the 15-minute reading target — don't overload
                    ### If topic weights don't add to 100%:
                    - Normalize proportionally
                    - Example: weights of 30, 30, 20 → treat as 37.5%, 37.5%, 25%
                    ### If a weighted topic isn't in the document:
                    - Mention it briefly with a note that the source doesn't cover it
                    - Redistribute that weight to related topics
                    ### If the source contains errors or unclear passages:
                    - Interpret reasonably and present the most logical understanding
                    - Don't invent information not supported by the source
                    ### If the source is highly technical:
                    - Define jargon on first use
                    - Build up from fundamentals before diving deep
                    - Use analogies to bridge complex concepts
                `
            },
            {
                role: "user",
                content: [
                    { 
                        type: "text",
                        text:`
                        ## User instructions
                        ${context.instructions}
                        ## Topic Focus & Weights
                        ${Object.entries(topicWeights).map(([topic, weight]) => `- ${topic}: ${weight}%`).join('\n')}

                        ${imageUrls?.length ? `## Available Images
                        Embed these where relevant to illustrate concepts:
                        ${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}` : ''}
                        Generate comprehensive study notes following the topic weights.`
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