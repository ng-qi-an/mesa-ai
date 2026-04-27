export function chunkText(input: string, chunkSize = 1800, overlap = 300): string[] {
    const text = input.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
    if (!text) {
        return [];
    }

    const safeChunkSize = Math.max(chunkSize, 400);
    const safeOverlap = Math.min(Math.max(overlap, 0), Math.floor(safeChunkSize / 2));
    const chunks: string[] = [];

    let start = 0;
    while (start < text.length) {
        const tentativeEnd = Math.min(start + safeChunkSize, text.length);
        let end = tentativeEnd;

        if (tentativeEnd < text.length) {
            const paragraphBreak = text.lastIndexOf("\n\n", tentativeEnd);
            const sentenceBreak = text.lastIndexOf(". ", tentativeEnd);
            if (paragraphBreak > start + Math.floor(safeChunkSize * 0.6)) {
                end = paragraphBreak + 2;
            } else if (sentenceBreak > start + Math.floor(safeChunkSize * 0.6)) {
                end = sentenceBreak + 1;
            }
        }

        const chunk = text.slice(start, end).trim();
        if (chunk) {
            chunks.push(chunk);
        }

        if (end >= text.length) {
            break;
        }
        start = Math.max(end - safeOverlap, start + 1);
    }

    return chunks;
}
