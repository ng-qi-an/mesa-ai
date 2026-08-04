import {
  convertToModelMessages,
  gateway,
  streamText,
  type UIMessage,
} from "ai";
import {
  aiDocumentFormats,
  injectDocumentStateMessages,
  toolDefinitionsToToolSet,
} from "@blocknote/xl-ai/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { chatModels } from "@/lib/utils/models";

export const maxDuration = 300;

type NotebookEditRequest = {
  messages: UIMessage[];
  toolDefinitions: Parameters<typeof toolDefinitionsToToolSet>[0];
  noteId: string;
};

export async function POST(req: Request) {
  const context: NotebookEditRequest = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!context.noteId) {
    return new Response("Notebook ID is required", { status: 400 });
  }

  if (!context.toolDefinitions) {
    return new Response("BlockNote tool definitions are required", {
      status: 400,
    });
  }

  const userNotebook = await db.query.notebook.findFirst({
    where: (notebook, { and, eq }) =>
      and(
        eq(notebook.id, context.noteId),
        eq(notebook.userId, session.user.id),
      ),
    columns: {
      id: true,
    },
  });

  if (!userNotebook) {
    return new Response("Notebook not found", { status: 404 });
  }

  const result = streamText({
    model: gateway(chatModels[0].name),
    system: aiDocumentFormats.html.systemPrompt,
    messages: await convertToModelMessages(
      injectDocumentStateMessages(context.messages),
    ),
    tools: toolDefinitionsToToolSet(context.toolDefinitions),
    toolChoice: "required",
  });

  return result.toUIMessageStreamResponse();
}