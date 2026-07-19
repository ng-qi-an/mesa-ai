'use server';
// This file was AI-generated but it works pretty well.

interface Chunk {
  content: string;
  index: number;
  metadata: {
    heading?: string;
    wordCount: number;
  };
}

const maxWords = 230;
const overlapWords = 20;

export async function chunkMarkdown(markdown: string): Promise<Chunk[]> {
  const lines = markdown.split("\n");
  const chunks: Chunk[] = [];
  let currentChunk: string[] = [];
  let currentHeading = "";
  let currentWordCount = 0;
  let index = 0;
  let previousTail = ""; // ← stores the end of the last flushed chunk
  const safeMaxWords = Math.max(1, maxWords);
  const effectiveOverlap = Math.max(0, Math.min(overlapWords, safeMaxWords));
  const maxOverflow = 50;

  function countWords(text: string): number {
    const matches = text.trim().match(/\S+/g);
    return matches ? matches.length : 0;
  }

  function getTailWords(text: string, wordCount: number): string {
    if (wordCount <= 0) return "";
    const words = text.split(/\s+/).filter(Boolean);
    return words.slice(-wordCount).join(" ");
  }

  function flush() {
    if (currentChunk.length === 0) return;
    let content = currentChunk.join("\n").trim();
    if (!content) return;
    const contentWordCount = countWords(content);

    // Prepend overlap from the previous chunk
    if (previousTail && content.length > 0) {
      content = previousTail + "\n" + content;
    }

    chunks.push({
      content,
      index: index++,
      metadata: {
        heading: currentHeading || undefined,
        wordCount: contentWordCount,
      },
    });

    // Store the last `overlap` words of this chunk for the next one
    previousTail = getTailWords(content, effectiveOverlap);
    currentChunk = [];
    currentWordCount = 0;
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flush();
      previousTail = ""; // avoid overlap across sections
      currentHeading = headingMatch[2];
      currentChunk.push(line);
      currentWordCount += countWords(line);
      continue;
    }

    currentChunk.push(line);
    currentWordCount += countWords(line);

    if (currentWordCount >= safeMaxWords) {
      if (line.trim() === "") {
        flush();
      } else if (currentWordCount >= safeMaxWords + maxOverflow) {
        flush();
      }
    }
  }

  flush();

  return chunks;
}