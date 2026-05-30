'use server';
import LlamaCloud from '@llamaindex/llama-cloud';

const client = new LlamaCloud({
  apiKey: process.env.LLAMA_PARSE_API_KEY,
});

export async function parseMarkdown(file_raw: File) {
    console.log("Uploading file...");
    const file = await client.files.create({
        file: file_raw,
        purpose: "parse",
    });

    const result = await client.parsing.parse({
        file_id: file.id,
        tier: "agentic",
        version: "latest",
        expand: ["markdown_full", "text_full"],
    });
    return { markdown: result.markdown_full, text: result.text_full };
}
