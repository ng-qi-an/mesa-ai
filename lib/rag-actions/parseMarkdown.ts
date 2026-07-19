'use server';
// import LlamaCloud, {Uploadable} from '@llamaindex/llama-cloud';

// const client = new LlamaCloud({
//   apiKey: process.env.LLAMA_PARSE_API_KEY,
// });

// export async function parseMarkdown(file_raw: Uploadable) {
//     console.log("⛅ Uploading file to LlamaCloud for parsing...");
//     const file = await client.files.create({
//         file: file_raw,
//         purpose: "parse",
//     });

//     const result = await client.parsing.parse({
//         file_id: file.id,
//         tier: "agentic",
//         version: "latest",
//         expand: ["markdown_full"],
//     });
//     return result.markdown_full;
// }


export async function parseMarkdown(file_url: string) {
    console.log("⛅ Uploading file to Mistral for parsing...");
    const r = await fetch("https://api.mistral.ai/v1/ocr", {
        method: "POST",
        body: JSON.stringify({
            document: {
                type: "document_url",
                document_url: file_url,
            },
            model: "mistral-ocr-latest",
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
        }
    });
    const response: {pages: [{markdown: string}]} = await r.json();
    if (!response.pages){
        throw new Error("Failed to parse the document. Response: " + JSON.stringify(response));
    }
    return response.pages.flat().map(page => page.markdown).join("");
}

