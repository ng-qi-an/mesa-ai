import { generateText } from "ai";
import getDownloadFileUrl from "../r2actions/files/getDownloadFileUrl";
import getUserFileContent from "../r2actions/files/getUserFileContent";
import { allowedFileTypes } from "../utils";
import { summaryModels } from "../utils/models";
import { parseMarkdown } from "./parseMarkdown";
import constructProvider from "../utils/constructProvider";

export default async function extractText({contentType, fileId}: {contentType: string, fileId: string}): Promise<string | null> {
    let markdownContent: string | null = null;
    console.log("[FILE PROCESSING] Begin extracting text/markdown from file");
    if (allowedFileTypes.text.includes(contentType) && contentType !== "text/html"){
        // Text file
        console.log("Detected as Text file.")
        try {
            const file = await getUserFileContent(fileId);
            markdownContent = new TextDecoder("utf-8").decode(file.data);
        } catch (error) {
            console.error("Failed to read text file content:", error);
            throw new Error("Failed to read text file content");
        }
    } else if (allowedFileTypes.documents.includes(contentType)){
        console.log("Detected as Document file.");
        try {
            console.log("Attempting to use Jina AI for markdown extraction...");
            const fileUrl = await getDownloadFileUrl(fileId);
            const r = await fetch(`https://r.jina.ai/${fileUrl}`);
            const rawText = await r.text();
            const actualStart = "Markdown Content:";
            const actualStartIndex = rawText.indexOf(actualStart);
            markdownContent = actualStartIndex >= 0 ? rawText.slice(actualStartIndex + actualStart.length).trim(): rawText;
            if (!markdownContent) {
                console.log("Document does not contain text. Using Mistral OCR to extract text from the document...");
                markdownContent = await parseMarkdown(fileUrl);
            }
        } catch (error) {   
            console.error("Failed to convert PDF content:", error);
            throw new Error("Failed to convert PDF content");
        }
    } else if (allowedFileTypes.images.includes(contentType)){
        console.log("Detected as Image file.");
        try {
            const file = await getUserFileContent(fileId);
            const data = file.data;
            if (!data) {
                throw new Error("No data found in file");
            }
            const summaryModelNames = summaryModels.map((model) => model.name);
            const description = await generateText({
                model: constructProvider(summaryModels[0]).chat(summaryModels[0].name),
                messages: [{role: "user", content: [
                {type: "text", text: `Your role is to extract details from images to be chunked later. Describe the content of the image in detail, including any text, objects, or diagrams. Be descriptive but concise. Focus on factual description rather than interpretation or speculation. You can use relevant markdown formatting. Keep to a maximum of 400 words.`},
                {
                    type: 'file',
                    data: data,
                    mediaType: 'image'
                }
                ]}],
                providerOptions: {
                openrouter: {
                    models: summaryModelNames,
                    route: "fallback",
                }
                },
            });
            markdownContent = description.text
            console.log("🖼️ Generated image description:", markdownContent);
        } catch (error) {
            console.error("Failed to generate image description:", error);
            throw new Error("Failed to generate image description");
        }
    } else {
        throw new Error(`Unsupported file type: ${contentType}`);
    }
    return markdownContent
}