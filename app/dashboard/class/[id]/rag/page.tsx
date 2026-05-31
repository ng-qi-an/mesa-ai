'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FileSelect } from "@/lib/schemas/schema";
import FileSelectorDialog from "@/components/file-browser/dialogs/FileSelectorDialog";
import jinaRead from "./(actions)/jinaRead";

export default function Page(){
    const [files, setFiles] = useState<FileSelect[]>([]);
    const [showFileSelector, setShowFileSelector] = useState(false);
    
    const [query, setQuery] = useState("");
    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
        api: '/api/rag',
        }),
    });
  
    return <div className="overflow-auto p-4 h-screen w-[80vw] flex flex-col gap-2">
        <FileSelectorDialog open={showFileSelector} setOpen={setShowFileSelector} onConfirm={(selectedFiles) => {
            const finalFiles = selectedFiles.filter((file)=> files.every((f) => f.id !== file.id))
            if (finalFiles.length === 0){
                setShowFileSelector(false);
                return;
            }
            setFiles((x) => [...x, ...finalFiles]);
            setShowFileSelector(false);
        }}/>
        <p className="text-2xl mb-4 mt-4">Test rag system</p>
        <Button onClick={() => setShowFileSelector(true)} className="shrink-0 w-max">Select files</Button>
        {files.map((file)=>{
            return <p key={file.id} className="cursor-pointer hover:line-through" onClick={()=> setFiles((x) => x.filter((f) => f.id !== file.id))}>{file.name} - {file.contentType} - {file.status}</p>
        })}
        <Button className="shrink-0 w-max" onClick={async () => {
            if (files.length > 0) {
                const fileId = files[0].id;
                const jinaUrl = await jinaRead(fileId);
                window.open(jinaUrl, "_blank");
            }
        }}>Open Jina Read</Button>
        <br/>
        <b>Response</b>
        <div className="overflow-auto h-full border p-4">
            {messages.length > 0 ? messages.map((message)=>{
                return <div key={message.id} className={message.role === "user" ? "text-right" : "text-left"}>
                    <p>{message.role}</p>
                    {message.parts.map(part => {
                        switch (part.type) {
                            
                        case 'tool-searchDocuments':
                            switch (part.state) {
                            case 'input-streaming':
                                return <pre key={part.toolCallId+part.state}>Searching...</pre>;
                            case 'input-available':
                                return <pre key={part.toolCallId+part.state}>Searching for &quot;{(part.input as { query: string }).query}&quot;</pre>;
                            case 'output-available':
                                return <pre key={part.toolCallId+part.state}>Searched for &quot;{(part.input as { query: string }).query}&quot;</pre>;
                            case 'output-error':
                                return <div key={part.toolCallId+part.state}>Error: {part.errorText}</div>;
                            }
                        case 'tool-listDocuments':
                            switch (part.state) {
                            case 'input-available':
                                return <pre key={part.toolCallId+part.state}>Retrieving document list...</pre>;
                            case 'output-available':
                                return <pre key={part.toolCallId+part.state}>Retrieved document list</pre>;
                            case 'output-error':
                                return <div key={part.toolCallId+part.state}>Error: {part.errorText}</div>;
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
                    await sendMessage({text: query}, {body: {fileIds: files.map((f) => f.id)}});
                }
            }}>Search</Button>
        </form>
    </div>
}