'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { parseMarkdown } from "./(actions)/parseMarkdown";
import { Streamdown } from "streamdown";
import { ragFile } from "./(actions)/ragFile";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export default function Page(){
    const [file, setFile] = useState<File | null>(null);
    const [markdown, setMarkdown] = useState("");
    const [chunkCount, setChunkCount] = useState(0);
    const searchParams = useSearchParams();
    const [ragDocumentId, setRagDocumentId] = useState(searchParams.get("id") || "");
    const [loadingMarkdown, setLoadingMarkdown] = useState<boolean>(false);
    const [loadingRag, setLoadingRag] = useState<boolean>(false);
    const router = useRouter();
    const [query, setQuery] = useState("");
    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
        api: '/api/rag',
        }),
    });
  
    return <div className="overflow-auto p-4 h-screen">
        <p className="text-2xl mb-4 mt-4">Test rag system</p>
        <b>PDF Markdown</b>
        <div className="overflow-auto max-h-[200px] h-full border p-4">
            <Streamdown mode="static">{markdown || "The markdown goes here"}</Streamdown>
        </div>
        <Input className="mt-4" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
        <Button disabled={loadingMarkdown} onClick={()=>{
            (async()=>{
                if (file){
                    setLoadingMarkdown(true);
                    try {
                        const res = await parseMarkdown(file)
                        if (res.markdown){
                            setMarkdown(res.markdown);
                        }
                    } catch (error) {
                        console.error("Error occurred while parsing markdown:", error);
                        toast.error("Failed to parse markdown from the file. Please try again.")
                    }
                    setLoadingMarkdown(false);
                }
            })();
        }}>Turn to Markdown</Button>
        <Button disabled={!markdown || loadingRag} onClick={async()=>{
            if (file){
                setLoadingRag(true);
                try {
                    const result = await ragFile({ file, markdown });
                    setChunkCount(result.chunkCount);
                    setRagDocumentId(result.documentId);
                    router.push("?id=" + result.documentId);
                    setLoadingRag(false);
                } catch (error) {
                    console.error("Error occurred while ragging file:", error);
                    setLoadingRag(false);
                    toast.error("Failed to rag the file. Please try again.")
                }
            }
        }}>{loadingRag ? "Ragging..." : "Rag it!"}</Button>
        <p>Chunks: {chunkCount}</p>
        <Label>Rag Document ID</Label>
        <Input value={ragDocumentId} onChange={(e) => setRagDocumentId(e.target.value)} />
        <b>Response</b>
        <div className="overflow-auto max-h-[400px] border p-4">
            {messages.length > 0 ? messages.map((message)=>{
                return <div key={message.id} className={message.role === "user" ? "text-right" : "text-left"}>
                    <p>{message.role}</p>
                    {message.parts.map(part => {
                        switch (part.type) {
                        case 'tool-searchDocuments':
                            switch (part.state) {
                            case 'input-streaming':
                                return <pre>Searching...</pre>;
                            case 'input-available':
                                return <pre key={part.toolCallId}>Searching for &quot;{(part.input as { query: string }).query}&quot;</pre>;
                            case 'output-available':
                                return <pre key={part.toolCallId}>Searched for &quot;{(part.input as { query: string }).query}&quot;</pre>;
                            case 'output-error':
                                return <div>Error: {part.errorText}</div>;
                            }
                        }
                    })}
                    <Streamdown>{message.parts.filter((part) => part.type === "text").map((part) => part.text).join("") || ""}</Streamdown>
                </div>
            }) : "The response goes here"}
        </div>
        <form>
            <Label>Send query</Label>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} />
            {error && <p className="text-red-500">{error.message}</p>}
            <p>Status: {status}</p>
            <Button disabled={status !== "ready" && status !== "error"} onClick={async (e) => {
                e.preventDefault();
                if (query.trim()) {
                    setQuery("");
                    await sendMessage({text: query});
                }
            }}>Search</Button>
        </form>
    </div>
}