// app/api/chat/route.ts
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { searchDocumentsTool } from "@/app/dashboard/class/[id]/rag/(actions)/searchDocuments";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "gemini-3-flash-preview", // or whatever Gemini model
    system: `You are a helpful assistant with access to the user's documents.
      Use the searchDocuments tool to find relevant information before answering.
      Always cite which document chunk you're referencing.`,
    messages: await convertToModelMessages(messages),
    tools: {
      searchDocuments: searchDocumentsTool,
    },
    stopWhen: stepCountIs(5), // lets the model use tools and continue
  });

  return result.toUIMessageStreamResponse();
}