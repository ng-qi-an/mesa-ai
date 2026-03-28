'use server';
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export default async function testGeneration(fileStoreId: string){
    const response = await generateText({
        model: google('gemini-2.5-flash'),
        tools: {
            file_search: google.tools.fileSearch({fileSearchStoreNames: [fileStoreId]}),
        },
        prompt: "Summarise the key themes in this set of notes into a short 100 word paragraph.",
    });
    console.log("Generation response:", response.text);
    return {text: response.text, sources: response.sources};
}