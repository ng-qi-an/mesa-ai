'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { parseMarkdown } from "./(actions)/parseMarkdown";
import { Streamdown } from "streamdown";

export default function Page(){
    const [file, setFile] = useState<File | null>(null);
    const [markdown, setMarkdown] = useState<string>("");
    const [loadingMarkdown, setLoadingMarkdown] = useState<boolean>(false);
    return <>
        <p>Test rag system</p>
        <span>Status</span>
        <b>PDF</b>
        <div className="overflow-auto h-[300px] border p-4">
            <Streamdown mode="static">{markdown || "DF markdown goes here"}</Streamdown>
        </div>
        <Input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
        <Button disabled={loadingMarkdown} onClick={()=>{
            (async()=>{
                if (file){
                    setLoadingMarkdown(true);
                    const res = await parseMarkdown(file)
                    if (res.markdown){
                        setMarkdown(res.markdown);
                    }
                    setLoadingMarkdown(false);
                }
            })();
        }}>Turn to Markdown</Button>
        <Button disabled={!markdown} onClick={()=>{

        }}>Rag it!</Button>
        <p>Chunks: </p>
        <b>Response</b>
        <div className="overflow-auto h-[300px] border p-4">
            <p>AI response here</p>
        </div>
        <form>
            <Label>Send query</Label>
            <Input></Input>
            <Button>Search</Button>
        </form>
    </>
}