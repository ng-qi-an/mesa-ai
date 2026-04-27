type OpenRouterEmbeddingResponse = {
    data: Array<{
        embedding: number[];
    }>;
};

export async function embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
        return [];
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is required for embeddings");
    }

    const baseUrl = (process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1").replace(/\/$/, "");
    const model = process.env.RAG_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";

    const response = await fetch(`${baseUrl}/embeddings`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            input: texts,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Embedding request failed (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as OpenRouterEmbeddingResponse;
    return payload.data.map((item) => item.embedding);
}
