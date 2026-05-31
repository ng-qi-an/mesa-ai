'use server';
import LlamaCloud, {Uploadable} from '@llamaindex/llama-cloud';

const client = new LlamaCloud({
  apiKey: process.env.LLAMA_PARSE_API_KEY,
});

export async function parseMarkdown(file_raw: Uploadable) {
    console.log("⛅ Uploading file to LlamaCloud for parsing...");
    const file = await client.files.create({
        file: file_raw,
        purpose: "parse",
    });

    const result = await client.parsing.parse({
        file_id: file.id,
        tier: "agentic",
        version: "latest",
        expand: ["markdown_full"],
    });
    return result.markdown_full;
}
