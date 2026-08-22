import { streamText, UIMessage, convertToModelMessages, Output } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notebookModels } from '@/lib/utils/models';
import { db } from '@/lib/db';
import constructProvider from '@/lib/utils/constructProvider';
import SaveToNotebook from '@/app/dashboard/class/[id]/notebooks/[noteId]/(actions)/saveToNotebook';
import { generateNoteSchema } from '../schema';
import { availableSubjects } from '@/lib/subjects/subjectsList';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    id: string;
    instructions: string;
    length: string;
}

        // [image: <short description or very short query>]
        // - Example: [image: cell division diagram]
        // - Example: [image: economic policy chart]
        // - Example: [image: World War I map]
        // - Example: [image: water cycle experiment setup]
        // - Keep the description concise like a search query, not a full sentence or a descriptive statement.
        // - Do not embed actual images or URLs; only use the placeholder format above
        // - If no images are relevant, continue without them


export async function POST(req: Request) {
    const context: NotebookRequestType = await req.json();
    
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    if (!context.id) {
        throw new Error("Notebook ID is required");
    }
    console.log("Using notebook:", context.id);
    const raw = await db.query.notebook.findFirst({
        columns: {title: true, subtitle: true },
        where: (notebook, {eq, and})=> and(eq(notebook.id, context.id), eq(notebook.userId, session.user.id)),
        with: {
            files: {
                with: {
                    file: {
                        columns: {id: true, name: true, contentType: true, markdown: true, images: true}
                    }
                }
            },
            class: {
                columns: {subject: true}
            }
        }
    })
    if (!raw) {
        throw new Error("Notebook not found or user does not have access");
    }
    const files = raw ? raw.files.map(f => f.file) : [];
    console.log("Using notebook:", context.id);
    console.log("Generating notes for user:", session.user.id);
    const result = streamText({
        model: constructProvider(notebookModels[0]).chat(notebookModels[0].name), // "google/gemini-3-flash-preview",
        output: Output.object({ schema: generateNoteSchema}),
        system: `You are an intelligent note-taking assistant that will generate structured notes. To guide your notes, you will be provided with files. You will use those files, in conjunction with the user's instructions, to generate a set of content-guided structured notes.
        ## File sources
        Below are the files the user uploaded as sources. Use them to ground your note generation and ensure all notes are supported by the content in these files.
        ${files.map(f => `### ${f.name} (${f.contentType})\n\n${f.markdown}`).join("\n\n")}
        ## Generating topics
        Use the content in the files to generate a set of topics in the topics field. The topics generated here should govern the notes content.
        - Use noun phrases or short descriptive titles
        - Be specific: "Climate Change Mitigation Strategies" not "Mitigation Strategies" or even "Strategies".
        - Match the terminology used in the source.
        - Avoid generic names like "Introduction" or "Overview".
        - As the user wants ${context.length} notes, generate ${
            context.length == "concise" ? "2-4 high-level topics that capture the key points of a source such that a brief summary can be made for readers with some prior knowledge."
            : context.length == "detailed" ? "8-12 specific topics that cover every aspects of the source, enabling a comprehensive set of notes for readers with no prior knowledge."
            : "5-8 balanced topics that cover the main themes and some specific details of the source, allowing for moderately detailed notes for readers with some prior knowledge."
        }
        ### Examples
                Source about economics:
                - Title: "Macroeconomic Policy Fundamentals"
                - Topics: ["Fiscal Policy Apps", "Monetary Policy Mechanisms", "Inflation and Unemployment", "International Trade Effects"]
                Source about biology:
                - Title: "Cell Division and Reproduction"  
                - Topics: ["Mitosis Process", "Meiosis and Genetic Variation", "Cell Cycle Regulation", "Chromosomal Abnormalities"]
                Source about history:
                - Title: "Causes of World War I"
                - Topics: ["Alliance Systems in Europe", "Imperial Rivalries", "Nationalism and Militarism", "The Assassination Trigger"]
        ### Edge Cases
        #### If the document has clear section headers:
        - Use them as a starting point, but consolidate if there are too many
        - Rename if headers are vague or overly long
        #### If the document is unstructured:
        - Identify recurring themes and concepts
        - Group related ideas into logical topics
        #### If topics overlap significantly:
        - Merge into a broader topic
        - Prefer fewer, well-defined topics over many overlapping ones
        ### If the document covers one narrow subject:
        - Break down into subtopics or aspects
        - Example: A document only about photosynthesis → ["Light-Dependent Reactions", "Calvin Cycle", "Factors Affecting Rate", "Photosynthesis in Ecosystems"]
        `,
        prompt: `
    ## Subject specific guidelines
    ${availableSubjects[raw.class.subject].instructions.notebook}
    ## Structure Guidelines
    ###  Title
    - Start off your notes with a title, formatted as a Heading 1, and a subtitle, formatted as a heading 6. After the header, add a horizontal divider, denoted by "---".
    - How to write a header: 3-7 words capturing the core subject. Be specific: "Cell Division Mechanisms" not "Biology Notes",
    - How to write a subtitle: One sentence describing what the reader will learn (Under 20 words)
    - Do not provide a summary or introduction paragraph after this.
    ### Length-specific guidelines
    ${context.length == "concise" ? `
    - Length mode: concise
    - Target 800-1100 words (readable in 5-8 minutes)
    - Focus on high-yield concepts with compact explanations
    - Include one practical example per major topic where possible
    - Always end with 3-4 key takeaways
` : context.length == "detailed" ? `
    - Length mode: detailed
    - Target 2300-3000 words (readable in 18-25 minutes)
    - Go deep on mechanisms, edge cases, and nuanced distinctions
    - Use multiple examples and include trade-offs/comparisons
    - Always end with 5-7 key takeaways
` : `
    - Length mode: balanced
    - Target 1500-2000 words (readable in 10-15 minutes)
    - Balance clarity and depth across weighted topics
    - Use examples and comparisons for understanding
    - Always end with 3-5 key takeaways
`}
    ### Writing Style
    - Explain concepts deeply, not just restate the source
    - Use analogies and layered examples for difficult ideas
    - Active voice preferred
    - Allocate word count proportionally to topic weight percentages
    - A topic with 40% weight should receive ~40% of the content depth

    ### Section structure
    - Create exactly one H2 section (##) for each topic listed in "Topic weights".
    - Use the exact topic names as the H2 headings in the same order they are listed.
    - Do not merge, rename, skip, or reorder topics.
    - Topic weights control depth, not whether a topic gets a section.
    - If the source has limited content for a topic, still include that topic heading with a brief "limited coverage in source" explanation.
    - Split each section with a horizontal divider (---) after the content for that topic.
    ## Formatting Rules
        ### Headings
        - use H1 (#) — Only for the main title, mentioned earlier.
        - Use H2 (##) for main topic sections
        - Use H3 (###) for subtopics within sections
        - Use H4 (####) for further nested subtopics
        ### Images
        Images should be frequently used when appropriate to illustrate key concepts, diagrams, or processes. 
        - You will be given a list of image URLs and a summary of the image contents to pick from.
        - Determine relevant images to include based on the content of each section.
        - Images can only be in a bullet point, or as a sub point. It can also be on a blank new line.
        - Images should not be inline with text, or be inside a table.
        To include an image, use the following format:
        ![<short description of alt text for image>](<imageUrl>)
        **Images in the source files**:
        ${raw.files.map(f => f.file.images?.map((image)=>{
            return `- http://localhost:3000/api/files/${f.file.id}/image/${image.id}: ${image.summary}\n`
        }))}
        ### Text Formatting
        - Use > blockquotes for important formulas, quotes, or critical points
        - Use \`inline code\` for technical terms, commands, or notation
        - Bullet points for unordered information (features, characteristics)
        - Numbered lists for sequences, steps, or ranked items
        - Keep list items concise — expand in paragraphs if needed
        - Tables for summarising comparisons, pros/cons, or structured data
`,
        onFinish: async()=>{
            console.log("[GENERATE NOTES] Saving shownotebookcreate:", context.id);
            await SaveToNotebook(context.id, {showNotebookCreate: false});
        }
        // reasoning: "minimal"
    });
    return result.toTextStreamResponse();

}