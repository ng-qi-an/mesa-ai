'use client';
import FileSelectorDialog from "@/components/file-browser/dialogs/FileSelectorDialog";
import { FileBrowserItem } from "@/components/file-browser/FileBrowserColumns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import addFilesToStore from "@/lib/file-search-actions/addFilesToStore";
import createFileStore from "@/lib/file-search-actions/createFileStore";
import testGeneration from "@/lib/file-search-actions/testGeneration";
import { useState } from "react";
import { toast } from "sonner";

export default function FileStoreTest(){
    const [files, setFiles] = useState<FileBrowserItem[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [notebookId, setNotebookId] = useState("");
    const [fileStoreId, setFileStoreId] = useState("");
    return <div>
        <FileSelectorDialog open={showDialog} setOpen={setShowDialog} onConfirm={(x)=>{
            setFiles(x);
            setShowDialog(false);
        }}/>
        <div>
            <p className="mb-2 mt-4 text-lg font-medium">Selected files</p>
            {files.map((file) => <div key={file.id}>{file.name}</div>)}
        </div>
        <Button onClick={() => setShowDialog(true)}>Select files</Button>
        <Input value={notebookId} onChange={(e) => setNotebookId(e.target.value)} placeholder="Notebook ID" />
        <Button disabled={!notebookId} onClick={async ()=>{
            if (!notebookId) {
                return;
            }
            const r = await createFileStore(notebookId)
            setFileStoreId(r.name!);
            console.log("Created file store with ID:", r);
            toast.success("Created file store with ID: " + r.name);            
        }}>Create file store</Button>
        <Input value={fileStoreId} onChange={(e) => setFileStoreId(e.target.value)} placeholder="File Store ID" />
        <Button disabled={!fileStoreId} onClick={async()=>{
            await addFilesToStore(files.map((f) => f.id), fileStoreId);
        }}>Add to file store</Button>
        <Button disabled={!fileStoreId} onClick={async()=>{
            const r = await testGeneration(fileStoreId);
            console.log("summary:", r.text, "sources:", r.sources);
            console.log("tool calls:", r.toolCalls);
            console.log("tool results:", r.toolResults);
        }}>
            Generate summary
        </Button>
    </div>
}