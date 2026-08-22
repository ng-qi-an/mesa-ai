import { z } from 'zod';

export const noteMetaSchema = z.object({
    header: z.string().describe('3-7 words capturing the core subject. Be specific: "Cell Division Mechanisms" not "Biology Notes"'),
    subtitle: z.string().describe('One sentence describing what the reader will learn (Under 20 words)'),
    topics: z.array(z.string()).describe('A list of distinct topics extracted from the source material. They must be mutually exclusive and cover the full scope of the material. Each topic should be a concise noun phrase representing a major section or theme in the content.'),
});

export type NoteMetaType = z.infer<typeof noteMetaSchema>;

export const generateNoteSchema = z.object({
    notes: z.string().describe("The generated notes content, formatted with specified guidelines in markdown."),
    topics: z.array(z.string()).describe('A list of distinct topics extracted from the source material. They must be mutually exclusive and cover the full scope of the material. Each topic should be a concise noun phrase representing a major section or theme in the content.'),
})
export type GenerateNoteSchemaType = z.infer<typeof generateNoteSchema>;