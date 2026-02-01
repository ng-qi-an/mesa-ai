import { streamText, Output } from 'ai';
import { google } from "@ai-sdk/google";
import { quizSchema } from './schema';


export async function POST(req: Request) {
  const formData = await req.formData();
  const fineTune = formData.get('fineTune') as string;
  const files = formData.getAll('files') as File[];

  // Convert files to content parts for the AI
  const fileContents = await Promise.all(
    files.map(async (file) => ({
      type: 'file' as const,
      data: Buffer.from(await file.arrayBuffer()),
      filename: file.name,
      mediaType: file.type,
    }))
  );

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    output: Output.array({ element: quizSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `Generate a set of 10 quiz questions with the attached documents. The documents may be slide decks, notes, pictures and even mindmaps. Your questions must be **strictly** from the documents provided and be a mix of multiple-choice and open-ended. By default, generate content-related questions to help the user acquire better understanding of this topic. To fine tune the results, you **must** consider the user's requests: ` + (fineTune || "No specific fine-tuning instructions.") },
          ...fileContents,
        ]
      }
    ]
  });

  // Stream complete elements in a format useObject can parse
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('['));
      let first = true;
      for await (const element of result.elementStream) {
        if (!first) {
          controller.enqueue(encoder.encode(','));
        }
        controller.enqueue(encoder.encode(JSON.stringify(element)));
        first = false;
      }
      controller.enqueue(encoder.encode(']'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}