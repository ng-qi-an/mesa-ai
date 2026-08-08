import { db } from "@/lib/db";
import { files } from "@/lib/schemas/schema";
import { eq } from "drizzle-orm";

export function createProcessingStream(fileId: string, streamId: string) {
  return new ReadableStream({
    async start(controller) {
        const enc = new TextEncoder();
        const send = async (status: string) => {
            await db.update(files).set({ status, streamId: (status == "processed" || status == "error") ? null : streamId }).where(eq(files.id, fileId));
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ status })}\n\n`));
        };
        try {
            await send("extracting");
            await extractContent(fileId);

            await send("indexing");
            await indexForSearch(fileId);

            await send("processed");
        } catch (err) {
            await send("error");
        } finally {
            controller.close();
        }
    },
  });
}

export async function ragFile(fileId: string, contentType: string) {
  // Parse the file
  console.log("* Starting RAG process for file:", fileId);
  console.log("Reading file with ID:", fileId);
  let markdownContent: string | null = null;
  if (allowedFileTypes.text.includes(contentType) && contentType !== "text/html"){
    console.log("Detected as Text file.")
    try {
      const file = await getUserFileContent(fileId);
      markdownContent = new TextDecoder("utf-8").decode(file.data);
    } catch (error) {
      console.error("Failed to read text file content:", error);
      throw new Error("Failed to read text file content");
    }
  } else if (allowedFileTypes.documents.includes(contentType)){
    console.log("Detected as Document file.");
    try {
      const fileUrl = await getDownloadFileUrl(fileId);
      const r = await fetch(`https://r.jina.ai/${fileUrl}`);
      const rawText = await r.text();
      const actualStart = "Markdown Content:";
      const actualStartIndex = rawText.indexOf(actualStart);
      markdownContent = actualStartIndex >= 0 ? rawText.slice(actualStartIndex + actualStart.length).trim(): rawText;
      if (!markdownContent) {
        console.log("Document does not contain text. Using Mistral OCR to extract text from the document...");
        markdownContent = await parseMarkdown(fileUrl);
      }
    } catch (error) {
      console.error("Failed to convert PDF content:", error);
      throw new Error("Failed to convert PDF content");
    }
  } else if (allowedFileTypes.images.includes(contentType)){
    console.log("Detected as Image file.");
    try {
      const file = await getUserFileContent(fileId);
      const data = file.data;
      if (!data) {
        throw new Error("No data found in file");
      }
      const summaryModelNames = summaryModels.map((model) => model.name);
      const description = await generateText({
        model: constructProvider(summaryModels[0]).chat(summaryModels[0].name),
        messages: [{role: "user", content: [
          {type: "text", text: `Your role is to extract details from images to be chunked later. Describe the content of the image in detail, including any text, objects, or diagrams. Be descriptive but concise. Focus on factual description rather than interpretation or speculation. You can use relevant markdown formatting. Keep to a maximum of 400 words.`},
          {
            type: 'file',
            data: data,
            mediaType: 'image'
          }
        ]}],
        providerOptions: {
          openrouter: {
            models: summaryModelNames,
            route: "fallback",
          }
        },
      });
      markdownContent = description.text
      console.log("🖼️ Generated image description:", markdownContent);
    } catch (error) {
      console.error("Failed to generate image description:", error);
      throw new Error("Failed to generate image description");
    }
  } else {
    throw new Error(`Unsupported file type: ${contentType}`);
  }
  // ===Old Llamaparse method below===
  // console.log("🗃️ Fetching file content from R2");
  // const file = await getUserFileContent(fileId);
  // if (!file || !file.data) {
  //     throw new Error("Failed to retrieve file content");
  // }
  // const bytes = file.data;
  // const arrayBuffer = bytes.buffer as ArrayBuffer;
  // const markdownFile = new File([arrayBuffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], fileName, {type: file.ContentType});

  // const markdownContent = await parseMarkdown(markdownFile);

  if (!markdownContent){
      throw new Error("Failed to parse markdown from file");
  }
  markdownContent = markdownContent.replace(/\u0000/g, "");
  console.log("Deleting previous chunks for file (if any)");
  await db.delete(fileChunks).where(eq(fileChunks.fileId, fileId));
  console.log("🔪 Chunking markdown content");
  const chunkList = await chunkMarkdown(markdownContent);
  console.log(`🔪 Split into ${chunkList.length} chunks`);

  // Embed all the chunks
  const texts = chunkList.map((c) => c.content);
  const embeddings = await embedManyTexts(texts);
  console.log(`🧠 Generated ${embeddings.length} embeddings`);

  // Store the chunks
  const values: FileChunkSelect[] = chunkList.map((chunk, index) => ({
    id: generateId(16),
    fileId: fileId,
    content: chunk.content,
    chunkIndex: chunk.index,
    embedding: embeddings[index],
  }));

  await db.insert(fileChunks).values(values);
  console.log(`✅ Stored ${values.length} chunks`);

  // Updating file status
  const summaryModelNames = summaryModels.map((model) => model.name);
  const summary = await generateText({
    model: constructProvider(summaryModels[0]).chat(summaryModels[0].name),
    prompt: `Summarise only the following content very concisely, in a single sentence. You must minimise fluff and keep to a MAXIMUM of 20 words. \n\n${markdownContent}`,
    providerOptions: {
      openrouter: {
        models: summaryModelNames,
        route: "fallback",
        reasoning: {effort: "none"}
      }
    },
  });
  console.log("📝 Generated file summary:", summary.text, `(${summary.text.split(" ").length})`);
  console.log("Cost:", summary.totalUsage);
  console.log("Provider metadata:", (summary.providerMetadata!.openrouter as {usage: unknown}).usage);
  await db.update(files).set({ status: "processed", summary: summary.text, markdown: markdownContent }).where(eq(files.id, fileId));
  console.log("⭐ Created summary and updated file status to 'processed'");
  return { fileId: fileId, chunkCount: values.length };
}