'use client';
import { useClass } from "@/components/providers/class-provider";
import { useNotebook } from "@/components/providers/notebook-provider";
import { availableSubjects } from "@/lib/subjects/subjectsList";

function lengthModeGuidelines(length: string) {
    const normalizedLength = ["concise", "balanced", "detailed"].includes(length) ? length : "balanced";

    if (normalizedLength === "concise") {
        return `
- Length mode: concise
- Target 800-1100 words (readable in 5-8 minutes)
- Focus on high-yield concepts with compact explanations
- Include one practical example per major topic where possible
- Always end with 3-4 key takeaways
`;
    }

    if (normalizedLength === "detailed") {
        return `
- Length mode: detailed
- Target 2300-3000 words (readable in 18-25 minutes)
- Go deep on mechanisms, edge cases, and nuanced distinctions
- Use multiple examples and include trade-offs/comparisons
- Always end with 5-7 key takeaways
`;
    }

    return `
- Length mode: balanced
- Target 1500-2000 words (readable in 10-15 minutes)
- Balance clarity and depth across weighted topics
- Use examples and comparisons for understanding
- Always end with 3-5 key takeaways
`;
}

export const buildNotesUpdatePrompt = ({topicWeights, length, instructions}: {topicWeights: Record<string, number>; length: string; instructions: string}) => `
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


export const defaultNotesInstructions = (length: string, subject: keyof typeof availableSubjects, customInstructions?: string, topics?: string[]) => `
    ## Subject specific guidelines
    ${availableSubjects[subject].instructions.notebook}
    ## Formatting Guidelines
    ### No title!
    - The title and summary of the note is already provided and should not be repeated in the content.
    - Start directly with the first topic heading. Do not provide a summary or introduction paragraph.
    ### Length-specific guidelines
    ${lengthModeGuidelines(length)}
    ### Writing Style
    - Explain concepts deeply, not just restate the source
    - Use analogies and layered examples for difficult ideas
    - Active voice preferred
    - Allocate word count proportionally to topic weight percentages
    - A topic with 40% weight should receive ~40% of the content depth
    
    ## Topics
    ${topics?.map(topic => `- ${topic}`).join("\n") || "No topics specified."}

    ## Section structure
    - Create exactly one H2 section (##) for each topic listed in "Topic weights".
    - Use the exact topic names as the H2 headings in the same order they are listed.
    - Do not merge, rename, skip, or reorder topics.
    - Topic weights control depth, not whether a topic gets a section.
    - If the source has limited content for a topic, still include that topic heading with a brief "limited coverage in source" explanation.
    
    ## Formatting Rules
        ### Headings
        - NEVER use H1 (#) — The title has already been provided
        - Use H2 (##) for main topic sections
        - Use H3 (###) for subtopics within sections
        - Use H4 (####) sparingly for detailed breakdowns
        ### Image Query Format
        If you want to illustrate a concept with an image, insert a placeholder in the following format:
        [image: <short description or very short query>]
        - Example: [image: cell division diagram]
        - Example: [image: economic policy chart]
        - Example: [image: World War I map]
        - Example: [image: water cycle experiment setup]
        - Keep the description concise like a search query, not a full sentence or a descriptive statement.
        - Do not embed actual images or URLs; only use the placeholder format above
        - If no images are relevant, continue without them
        ### Text Formatting
        - Use > blockquotes for important formulas, quotes, or critical points
        - Use \`inline code\` for technical terms, commands, or notation
        - Bullet points for unordered information (features, characteristics)
        - Numbered lists for sequences, steps, or ranked items
        - Keep list items concise — expand in paragraphs if needed
        - Tables for summarising comparisons, pros/cons, or structured data

    ##

    ${customInstructions?.trim() ? `
    ## Custom user iinstructions
        - Follow the following user-provided strictly preferences after considering the rules above.
    ${customInstructions.trim()}
    ` : ""}
`

        
export async function generateNotes({noteId, instructions, fileIds, topicWeights, length, setCollapseSections, sendNotesFollowup}: {
    noteId: string;
    instructions: string;
    fileIds: string[];
    topicWeights: Record<string, number>;
    length: string;
    setCollapseSections: (collapse: boolean) => void;
    sendNotesFollowup: any;
}){
    console.log("Received generating notes request with instructions:", instructions);
    setCollapseSections(true);
    // setIsCacheLoading(true);
    // let newCache;
    // if (!cache || !checkCacheMatch(cache.fileIds, fileIds)){
    //     console.log("[GEN NOTES] Cache files differ from provided files. Creating cache...");
    //     newCache = await createCache(fileIds)
    // } else {
    //     console.log("[GEN NOTES] Cache files match provided files. Extending cache...");
    //     newCache = await createOrExtendCache(cache.name, fileIds)
    // }
    // setIsCacheLoading(false);
    // console.log("Using cache:", newCache.name, "Expire time:", newCache.expireTime, "Total tokens:", newCache.usageMetadata?.totalTokenCount);
    // setCache(newCache.name!, fileIds);
    // await SaveToNotebook(noteId, {cache: {name: newCache.name!, fileIds: fileIds}});
    console.log("Instructions for follow-up:", instructions);
    if (topicWeights && Object.keys(topicWeights).length !== 0){
        sendNotesFollowup({
            text: instructions,
        }, {
            body: {
                topicWeights: topicWeights,
                id: noteId,
            }
        })
    } else {
        throw new Error("No topic weights provided");
    }
}


export function useGenerateNotes(){
    const { setCollapseSections, files, instructions, topicWeights, sendNotesFollowup, length, noteId } = useNotebook();

    return {
        generateNotes: async(customProps?: Record<string, any>) => {
            const resolvedLength = customProps?.length ?? length;
            const resolvedInstructions = customProps?.instructions ?? instructions;
            const resolvedTopicWeights = customProps?.topicWeights ?? topicWeights;
            return await generateNotes({
                noteId,
                fileIds: files.map(f=>f.id),
                topicWeights: resolvedTopicWeights,
                setCollapseSections,
                sendNotesFollowup: sendNotesFollowup,
                ...customProps,
                length: resolvedLength,
                instructions: resolvedInstructions,
            })
        }
    };
}