// app/api/chat/route.ts
import { convertToModelMessages, isStepCount, streamText, UIMessage } from "ai";
import { searchDocumentsTool } from "@/lib/rag-actions/searchDocumentsTool";
import { listDocumentsTool } from "@/lib/rag-actions/listDocumentsTool";

export async function POST(req: Request) {
  const { messages, fileIds }: { messages: UIMessage[], fileIds: string[] } = await req.json();

  const result = streamText({
    model: "gemini-3-flash-preview", // or whatever Gemini model
    instructions: `You are a helpful assistant with access to the user's documents.
    - When the user asks a question related to their documents, always use the listDocuments tool first to see what documents are available, then use the searchDocuments tool to find relevant information. Rephrase search queries to be more specific and relevant. You can break a large search query into multiple smaller queries. Avoid vague words like "summary" or "details" unless paired with topics.
    - Should no relevant information be found, try a broader search query. If all tool calls are exhausted, answer to the best of your ability with the information you have, but be sure to note that your answer may be incomplete.`,
    messages: await convertToModelMessages(messages),
    tools: {
      listDocuments: listDocumentsTool(fileIds),
      searchDocuments: searchDocumentsTool(fileIds),
    },
    stopWhen: isStepCount(5), // lets the model use tools and continue
  });

  return result.toUIMessageStreamResponse();
}