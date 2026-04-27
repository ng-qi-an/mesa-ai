import { RetrievedChunk } from "@/lib/rag/retrieveChunks";

export function formatRetrievedContext(chunks: RetrievedChunk[]): string {
    if (chunks.length === 0) {
        return "No relevant source excerpts were found for this request.";
    }

    return chunks
        .map((chunk, idx) => {
            const fileName = typeof chunk.metadata.fileName === "string" ? chunk.metadata.fileName : chunk.fileId;
            return [
                `Source ${idx + 1}`,
                `- fileId: ${chunk.fileId}`,
                `- fileName: ${fileName}`,
                `- chunkIndex: ${chunk.chunkIndex}`,
                `- relevanceScore: ${chunk.score.toFixed(4)}`,
                `Excerpt:`,
                chunk.content,
            ].join("\n");
        })
        .join("\n\n");
}

export function extractLatestUserText(messages: Array<{ role?: string; parts?: Array<{ type?: string; text?: string }> }>): string {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const message = messages[i];
        if (message.role !== "user") {
            continue;
        }
        const textParts = (message.parts ?? [])
            .filter((part) => part.type === "text")
            .map((part) => part.text ?? "")
            .join("\n")
            .trim();
        if (textParts) {
            return textParts;
        }
    }

    return "Summarize and answer using the selected source material.";
}
