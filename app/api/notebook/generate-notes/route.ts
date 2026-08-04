import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notebookModels } from '@/lib/utils/models';
import { db } from '@/lib/db';
import constructProvider from '@/lib/utils/constructProvider';

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

type NotebookRequestType = {
    topicWeights?: Record<string, number>;
    id: string;
    messages: UIMessage[];
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
    if (!context.id) {
        throw new Error("Notebook ID is required");
    }
    const topicWeights = context.topicWeights!
    const raw = await db.query.notebook.findFirst({
        columns: {},
        where: (notebook, {eq, and})=> and(eq(notebook.id, context.id), eq(notebook.userId, session.user.id)),
        with: {
            files: {
                with: {
                    file: {
                        columns: {name: true, contentType: true, markdown: true}
                    }
                }
            }
        }
    })
    const files = raw ? raw.files.map(f => f.file) : [];

    console.log("Using topic weights:", topicWeights);
    console.log("Using notebook:", context.id);
    console.log("Generating notes for user:", session.user.id);
    const result = streamText({
        model: constructProvider(notebookModels[0]).chat(notebookModels[0].name), // "google/gemini-3-flash-preview",
        system: `You are an intelligent note-taking assistant that will generate structured notes. To guide your notes, you will be provided with files. You will use those files, in conjunction with the user's instructions, to generate a set of content-guided structred notes.
        ## File sources
        Below are the files the user uploaded as sources. Use them to ground your note generation and ensure all notes are supported by the content in these files.
        ${files.map(f => `### ${f.name} (${f.contentType})\n\n${f.markdown}`).join("\n\n")}
        `,
        messages: await convertToModelMessages(context.messages),
        // reasoning: "minimal"
    });
    return result.toUIMessageStreamResponse();

}