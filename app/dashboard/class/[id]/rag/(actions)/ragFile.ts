'use server';
import { chunkMarkdown } from "./chunkMarkdown";
import { embedManyTexts } from "./embedding";
import { chunks, documents } from "@/lib/schemas/rag-schema";
import { parseMarkdown } from "./parseMarkdown";
import { db } from "@/lib/db";
import { generateId } from "better-auth";

interface IngestOptions {
  file: File,
  markdown?: string,
}

export async function ragFile({ file, markdown }: IngestOptions) {
  // 1. Chunk
  let markdownContent = markdown;
  if (!markdownContent){
    const _markdownRaw = await parseMarkdown(file);
    if (!_markdownRaw.markdown){
        throw new Error("Failed to parse markdown from file");
    }
    markdownContent = _markdownRaw.markdown;
  }
  const chunkList = await chunkMarkdown(markdownContent);
  console.log(`🔪 Split into ${chunkList.length} chunks`);

  // 2. Create the document row
  const [doc] = await db
    .insert(documents)
    .values({ id: generateId(16), title: file.name })
    .returning({ id: documents.id });

  const docId = doc.id;

  // 3. Embed all chunks in one batch
  const texts = chunkList.map((c) => c.content);
  const embeddings = await embedManyTexts(texts);
  console.log(`🧠 Generated ${embeddings.length} embeddings`);

  // 4. Store chunks + embeddings in Neon
  const values = chunkList.map((chunk, i) => ({
    id: generateId(16),
    documentId: docId,
    content: chunk.content,
    chunkIndex: chunk.index,
    metadata: chunk.metadata,
    embedding: embeddings[i],
  }));

  await db.insert(chunks).values(values);
  console.log(`✅ Stored ${values.length} chunks in Neon`);

  return { documentId: docId, chunkCount: values.length };
}