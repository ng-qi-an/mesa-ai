'use server';

interface Chunk {
  content: string;
  index: number;
  metadata: {
    heading?: string;
    charCount: number;
  };
}

export async function chunkMarkdown(markdown: string, maxChars = 3200, overlap = 200): Promise<Chunk[]> {
  const lines = markdown.split("\n");
  const chunks: Chunk[] = [];
  let currentChunk: string[] = [];
  let currentHeading = "";
  let currentLength = 0;
  let index = 0;
  let previousTail = ""; // ← stores the tail of the last flushed chunk
  const safeMaxChars = Math.max(1, maxChars);
  const effectiveOverlap = Math.max(0, Math.min(overlap, safeMaxChars));
  const maxOverflow = Math.max(200, Math.floor(safeMaxChars * 0.2));

  function flush() {
    if (currentChunk.length === 0) return;
    let content = currentChunk.join("\n").trim();
    if (!content) return;

    // Prepend overlap from the previous chunk
    if (previousTail && content.length > 0) {
      content = previousTail + "\n" + content;
    }

    chunks.push({
      content,
      index: index++,
      metadata: {
        heading: currentHeading || undefined,
        charCount: content.length,
      },
    });

    // Store the last `overlap` characters of this chunk for the next one
    previousTail = content.slice(-effectiveOverlap);
    currentChunk = [];
    currentLength = 0;
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flush();
      previousTail = ""; // avoid overlap across sections
      currentHeading = headingMatch[2];
      currentChunk.push(line);
      currentLength += line.length + 1;
      continue;
    }

    currentChunk.push(line);
    currentLength += line.length + 1;

    if (currentLength >= safeMaxChars) {
      if (line.trim() === "") {
        flush();
      } else if (currentLength >= safeMaxChars + maxOverflow) {
        flush();
      }
    }
  }

  flush();

  return chunks;
}