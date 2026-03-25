'use client';
import { NotebookContextType, useNotebook } from "@/components/providers/notebook-provider";
import createCache from "@/lib/cache-actions/createCache";
import createOrExtendCache from "@/lib/cache-actions/createOrExtendCache";
import { FileListType } from "@/lib/r2actions/getUserFilesv2";
import checkCacheMatch from "./checkCacheMatch";

const lengthModeGuidelines = (length: string) => {
    const normalizedLength = ["concise", "balanced", "detailed"].includes(length) ? length : "balanced";

    if (normalizedLength === "concise") {
        return `
- Length mode: concise
- Target 800-1100 words (readable in 5-8 minutes)
- Focus on high-yield concepts with compact explanations
- Include one practical example per major topic where possible
- End with 3-4 key takeaways
`;
    }

    if (normalizedLength === "detailed") {
        return `
- Length mode: detailed
- Target 2300-3000 words (readable in 18-25 minutes)
- Go deep on mechanisms, edge cases, and nuanced distinctions
- Use multiple examples and include trade-offs/comparisons
- End with 5-7 key takeaways
`;
    }

    return `
- Length mode: balanced
- Target 1500-2000 words (readable in 10-15 minutes)
- Balance clarity and depth across weighted topics
- Use examples and comparisons for understanding
- End with 3-5 key takeaways
`;
}

export const buildNotesUpdatePrompt = ({
    topicWeights,
    length,
    instructions,
}: {
    topicWeights: Record<string, number>;
    length: string;
    instructions: string;
}) => `
The user wants to make some changes to the notes based on the following topic weights, note length and instructions. Update the content accordingly, while still respecting the original source material and formatting rules:
# Topic weights
${Object.keys(topicWeights).map((topic) => `- ${topic}: ${topicWeights[topic]}`).join("\n")}
# Note Length
${length}
# Length-specific guidelines
${lengthModeGuidelines(length)}
# Instructions
${instructions}
`


export const defaultNotesInstructions = (length: string, customInstructions?: string, topics?: string[]) => `
    ${(() => {
        const normalizedLength = ["concise", "balanced", "detailed"].includes(length) ? length : "balanced";

        const contentGuidelinesByLength: Record<string, string> = {
            concise: `
    ## Content Guidelines
        ### No title!
        - The title and summary of the note is already provided and should not be repeated in the content.
        - Start directly with the first topic heading. Do not provide a summary or introduction paragraph.
        ### Length & Readability
        - Target 800-1100 words (readable in 5-8 minutes)
        - Keep explanations concise and focused on high-yield concepts
        - Allocate word count proportionally to topic weight percentages
        - A topic with 40% weight should receive ~40% of the content depth
        ### Writing Style
        - Explain concepts clearly without unnecessary detail
        - Use short examples to anchor understanding
        - Prioritize clarity and quick comprehension
        - Active voice preferred
        ### Structure Each Topic Section
        1. One-sentence intro (what is this and why it matters)
        2. Core explanation with one practical example
        3. Key relationship or comparison only if high value
        ### Always End With
        A "Key Takeaways" section containing 3-4 bullet points summarizing the most important concepts.
`,
            balanced: `
    ## Content Guidelines
        ### No title!
        - The title and summary of the note is already provided and should not be repeated in the content.
        - Start directly with the first topic heading. Do not provide a summary or introduction paragraph.
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
`,
            detailed: `
    ## Content Guidelines
        ### No title!
        - The title and summary of the note is already provided and should not be repeated in the content.
        - Start directly with the first topic heading. Do not provide a summary or introduction paragraph.
        ### Length & Readability
        - Target 2300-3000 words (readable in 18-25 minutes)
        - Go deeper on mechanisms, edge cases, and nuanced distinctions
        - Allocate word count proportionally to topic weight percentages
        - A topic with 40% weight should receive ~40% of the content depth
        ### Writing Style
        - Explain concepts deeply, not just restate the source
        - Use analogies and layered examples for difficult ideas
        - Connect ideas across topics to build conceptual understanding
        - Active voice preferred
        ### Structure Each Topic Section
        1. Brief intro (what is this and why does it matter?)
        2. Core explanation with multiple examples
        3. Key relationships, comparisons, and trade-offs
        4. Common misconceptions and how to correct them
        5. Practical implications or real-world application when relevant
        ### Always End With
        A "Key Takeaways" section containing 5-7 bullet points summarizing the most important concepts.
`,
        };

        return contentGuidelinesByLength[normalizedLength];
    })()}

    ## Topics
    ${topics?.map(topic => `- ${topic}`).join("\n") || "No topics specified."}

    ## Required section structure
    - Create exactly one H2 section (##) for each topic listed in "Topic weights".
    - Use the exact topic names as the H2 headings in the same order they are listed.
    - Do not merge, rename, skip, or reorder topics.
    - Topic weights control depth, not whether a topic gets a section.
    - If the source has limited content for a topic, still include that topic heading with a brief "limited coverage in source" explanation.

    ## Weight handling
    - Allocate explanation depth proportionally to the topic weights.
    - Higher-weight topics should receive proportionally more detail, examples, and subpoints.
    - Lower-weight topics should still be covered, but more briefly.
    
    ## Formatting Rules
        ### Headings
        - NEVER use H1 (#) — The title has already been provided
        - Use H2 (##) for main topic sections
        - Use H3 (###) for subtopics within sections
        - Use H4 (####) sparingly for detailed breakdowns
        ### Images
        If you want to illustrate a concept with an image, insert a placeholder in the following format:
        [image: <short description or query>]
        - Example: [image: cell division diagram]
        - Example: [image: economic policy chart]
        - Example: [image: World War I map]
        - Example: [image: water cycle experiment setup]
        - Place the image placeholder after introducing the concept it illustrates
        - Keep the description concise like a search query, not a full sentence.
        - Do not embed actual images or URLs; only use the placeholder format above
        - Don't cluster images — spread them throughout the content
        - If no images are relevant, continue without them
        ### Text Formatting
        - **Bold** for key terms and vocabulary
        - *Italics* for definitions and emphasis
        - Use > blockquotes for important formulas, quotes, or critical points
        - Use \`inline code\` for technical terms, commands, or notation
        - Bullet points for unordered information (features, characteristics)
        - Numbered lists for sequences, steps, or ranked items
        - Keep list items concise — expand in paragraphs if needed
        ## VERY IMPORTANT: Math formatting
        - When generating math equations using Latex format, always use 2 dollar signs ($$) rather than 1 dollar sign ($). For example, instead of $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ use $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
    ## Edge Case Handling
        ### If the document is very short:
        - Focus on depth over breadth
        - Add contextual explanations the source may assume
        - Still respect topic weight ratios
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

    ${customInstructions?.trim() ? `
    ## Additional User Instructions
        - Follow the following user-provided preferences in addition to all default rules above.

${customInstructions.trim()}
    ` : ""}
    `

        
export async function generateNotes({instructions, fileIds, topicWeights, length, cache, setCollapseSections, setIsCacheLoading, setCache, sendNotesFollowup}: {
    instructions: string;
    fileIds: string[];
    topicWeights: Record<string, number>;
    length: string;
    cache: {name: string; fileIds: string[]} | null;
    setCollapseSections: (collapse: boolean) => void;
    setIsCacheLoading: (loading: boolean) => void;
    setCache: (name: string, fileIds: string[]) => void;
    sendNotesFollowup: any;
}){
    console.log("Received generating notes request with instructions:", instructions);
    setCollapseSections(true);
    setIsCacheLoading(true);
    let newCache;
    if (!cache || !checkCacheMatch(cache.fileIds, fileIds)){
        console.log("[GEN NOTES] Cache files differ from provided files. Creating cache...");
        newCache = await createCache(fileIds, 900)
    } else {
        console.log("[GEN NOTES] Cache files match provided files. Extending cache...");
        newCache = await createOrExtendCache(cache.name, fileIds, 900)
    }
    setIsCacheLoading(false);
    console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
    setCache(newCache.name!, fileIds);
    if (topicWeights && Object.keys(topicWeights).length !== 0){
        sendNotesFollowup({
            text: instructions,
        }, {
            body: {
                topicWeights: topicWeights,
                cacheName: newCache.name!
            }
        })
    } else {
        throw new Error("No topic weights provided");
    }
}


export function useGenerateNotes(){
    const { setIsCacheLoading, setCache, setCollapseSections, files, instructions, topicWeights, cache, sendNotesFollowup, length } = useNotebook();

    return {
        generateNotes: async(customProps?: Record<string, any>) => {
            const resolvedLength = customProps?.length ?? length;
            const resolvedInstructions = customProps?.instructions ?? instructions;
            const resolvedTopicWeights = customProps?.topicWeights ?? topicWeights;
            const includeContext = customProps?.includeContext ?? true;

            return await generateNotes({
                fileIds: files.map(f=>f.id),
                topicWeights: resolvedTopicWeights,
                cache,
                setCollapseSections,
                setIsCacheLoading,
                setCache,
                sendNotesFollowup: sendNotesFollowup,
                ...customProps,
                length: resolvedLength,
                instructions: resolvedInstructions,
            })
        }
    };
}