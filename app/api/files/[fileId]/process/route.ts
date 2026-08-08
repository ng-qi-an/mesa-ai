import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { streamContext } from "@/lib/resumableStream";
import { files } from "@/lib/schemas/schema";
import { generateId } from "better-auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { chunkMarkdown } from "@/lib/rag-actions/chunkMarkdown";
import { embedManyTexts } from "@/lib/rag-actions/embedding";
import extractText from "@/lib/rag-actions/extractText";
import { fileChunks, FileChunkSelect } from "@/lib/schemas/schema";
import constructProvider from "@/lib/utils/constructProvider";
import { summaryModels } from "@/lib/utils/models";
import { generateText } from "ai";

export async function POST(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
    const { fileId } = await params;
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        console.log("unauthorised")
        throw new Error("Unauthorized");
    }
    const fileList = await db.select().from(files).where(and(eq(files.userId, session.user.id), eq(files.id, fileId)));
    if (fileList.length === 0) {
        console.log("file not found")
        throw new Error("File not found");
    }
    const file = fileList[0];
    if (file.status == "processed"){
        console.log("file already processed")
        throw new Error("File already processed");
    }
    const streamId = file.status === "processing" && file.streamId ? file.streamId : "process-file-"+generateId();

    if (file.status !== "processing") {
        await db.update(files).set({ status: "processing", streamId: streamId }).where(eq(files.id, fileId));
    }
    const stream = await streamContext.createNewResumableStream(streamId, () => createProcessingStream(fileId, streamId));
    return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
}

export function createProcessingStream(fileId: string, streamId: string) {
  return new ReadableStream({
    async start(controller) {
        const send = async (status: string) => {
            await db.update(files).set({ status, streamId: (status == "processed" || status == "error") ? null : streamId }).where(eq(files.id, fileId));
            controller.enqueue(`data: ${JSON.stringify({ status })}\n\n`); // plain string now
        };
        const file = await db.select({contentType: files.contentType}).from(files).where(eq(files.id, fileId)).then((res) => res[0]);
        console.log("[FILE PROCESSING] Starting processing for file:", fileId, "with content type:", file.contentType);
        try {
          // Begin embedding files
          await send("extracting");
          let markdown = await extractText({contentType: file.contentType, fileId});
          if (!markdown){
            throw new Error("Failed to parse markdown from file");
          }
          markdown = markdown.replace(/\u0000/g, "");
          
          // After getting the markdown, split the text into chunks
          await send("chunking");
          console.log("[FILE PROCESSING] Deleting previous chunks for file (if any)");
          await db.delete(fileChunks).where(eq(fileChunks.fileId, fileId));
          console.log("[FILE PROCESSING] Chunking markdown content");
          const chunkList = await chunkMarkdown(markdown);
          console.log(`🔪 Split into ${chunkList.length} chunks`);

          // Then embed the chunks
          await send("embedding");
          console.log("[FILE PROCESSING] Begin embedding file chunks");
          const texts = chunkList.map((c) => c.content);
          const embeddings = await embedManyTexts(texts);
          console.log(`🧠 Generated ${embeddings.length} embeddings`);
          // Store chunks
          const values: FileChunkSelect[] = chunkList.map((chunk, index) => ({
            id: generateId(16),
            fileId: fileId,
            content: chunk.content,
            chunkIndex: chunk.index,
            embedding: embeddings[index],
          }));
          await db.insert(fileChunks).values(values);
          console.log(`✅ Stored ${values.length} chunks`);

          // Make file content summary
          console.log("[FILE PROCESSING] Begin summarising file content");
          await send("summarising");
          const summaryModelNames = summaryModels.map((model) => model.name);
          const summary = await generateText({
            model: constructProvider(summaryModels[0]).chat(summaryModels[0].name),
            prompt: `Summarise only the following content very concisely, in a single sentence. You must minimise fluff and keep to a MAXIMUM of 20 words. \n\n${markdown}`,
            providerOptions: {
              openrouter: {
                models: summaryModelNames,
                route: "fallback",
                reasoning: {effort: "none"}
              }
            },
          });
          console.log("📝 Generated file summary,", `${summary.text.split(" ").length} words`);
          await db.update(files).set({summary: summary.text, markdown: markdown }).where(eq(files.id, fileId));
          console.log("⭐ Finished processing file:", fileId, "and saved summary!");
          await send("processed");
        } catch (err) {
          console.log("❌ Error processing file:", fileId, err);
          await send("error");
        } finally {
          controller.close();
        }
    },
  });
}