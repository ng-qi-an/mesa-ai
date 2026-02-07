import { z } from 'zod';

// define a schema for the notifications
export const noteSchema = z.object({
    header: z.string().describe('3-7 words capturing the core subject. Be specific: "Cell Division Mechanisms" not "Biology Notes"'),
    subtitle: z.string().describe('One sentence describing what the reader will learn (Under 20 words)'),
    content: z.string().describe('The markdown body of the notes. Rules are stated in system prompt.'),
});

export type NoteContentType = z.infer<typeof noteSchema>;

export const noteTopicSchema = z.object({
    topics: z.array(z.string()).describe('A list of 3-8 distinct topics extracted from the source material. They must be mutually exclusive and cover the full scope of the material. Each topic should be a concise noun phrase representing a major section or theme in the content.'),
});

export type NoteTopicType = z.infer<typeof noteTopicSchema>;