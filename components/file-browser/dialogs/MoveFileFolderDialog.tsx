'use client';
import { FileBrowserProvider, useFileBrowser } from "@/components/providers/file-browser-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FileSelect } from "@/lib/schemas/schema";
import { FolderInput, FolderPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FileBrowser from "../FileBrowser";
import { FileBrowserItem } from "../FileBrowserColumns";
import revalidateMoveAction from "./revalidateMoveAction";
import FileBrowserBreadcrumbs from "../FileBrowserBreadcrumbs";
import { allowedMimeTypes } from "@/lib/utils";
import moveUserFile from "@/lib/r2actions/files/moveUserFile";
import { useClass } from "@/components/providers/class-provider";
import CreateFolderDialog from "./CreateFolderDialog";

export default function MoveFileFolderDialog({ open, setOpen, isFolder, itemId, itemName }: { open: boolean, setOpen: (open: boolean) => void, isFolder: boolean, itemId: string, itemName: string }) {
    const [moving, setMoving] = useState(false);
    const pathname = usePathname()
    const [nests, setNests] = useState<FileSelect[]>([]);
    const [files, setFiles] = useState<FileBrowserItem[]>([]);
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<FileSelect | null>(null);
    const [loading, setLoading] = useState(true);
    const { _class } = useClass();

    useEffect(()=>{
        async function fetchData(nests: FileSelect[]) {
            const r = await revalidateMoveAction(nests, _class.id)
            setFiles(r.map((f)=> ({...f, key: f.id})))
            setLoading(false);
        }
        if (open){
            setLoading(true);
            fetchData(nests);
        } else {
            setSelectedFolder(null);
        }
    }, [open, nests])
    
    const { revalidateData } = useFileBrowser();
    return <FileBrowserProvider nests={nests} setNests={setNests} files={files} 
        revalidateData={async()=> {
            const r = await revalidateMoveAction(nests, _class.id)
            setFiles(r.map((f)=> ({...f, key: f.id})))
        }
    }> 
        <Dialog open={open} onOpenChange={(x)=>{
            if (!x){
                setNests([]);
                setSelectedFolder(null);
            }
            setOpen(x)
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Move {isFolder ? "Folder" : "File"}</DialogTitle>
                    <DialogDescription>Folders help to organise files into distinct sections.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col overflow-auto w-full">
                    <div className="flex items-center justify-between">
                        <FileBrowserBreadcrumbs nests={nests} setNests={setNests} classNames={{page: 'font-medium text-base', link: 'text-base'}}/>
                        <Button variant="outline" onClick={()=>{
                            setCreateFolderOpen(true);
                        }}><FolderPlus/> New folder</Button>
                    </div>
                    {loading ? 
                        <div className="flex items-center justify-center w-full py-13"><Spinner className="text-2xl"/></div>
                    : <>                   
                        <div className="flex w-full overflow-auto mt-3">
                            <FileBrowser hideFileTypes={allowedMimeTypes.filter((x)=> x != "application/x-directory")} selected={selectedFolder ? [selectedFolder.id]: []} className="w-full" files={files.filter((x)=> x.id != itemId)} hideColumns={["dateModified"]} onItemSelect={(file) => {
                                if (selectedFolder?.id == file.id){
                                    setSelectedFolder(null);
                                } else {
                                    setSelectedFolder(file);
                                }
                            }} onSecondaryItemSelect={async (file)=>{
                                if (file.contentType == "application/x-directory") {
                                    setSelectedFolder(file);
                                    setNests([...nests, file])
                                }
                            }}/>
                        </div>
                        <p className="mt-3 text-muted-foreground">Moving {isFolder ? "folder": "file"} into <b>{selectedFolder?.name || "Drive"}</b>. Select to change folder, double-click to open it.</p>
                    </>
                    }
                </div>
                <DialogFooter className="flex-col">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={moving || loading} onClick={async ()=>{
                        setMoving(true);                 
                        try {
                            await moveUserFile(itemId, itemName, selectedFolder ? selectedFolder!.id : null);
                            setOpen(false)
                            await revalidateData(pathname);
                        } catch (error) {
                            if (error instanceof Error){
                                if (error.message === "already_exists") {
                                    toast.error(`An item with the same name already exists in the destination folder.`);
                                } else if (error.message === "same_parent") {
                                    setOpen(false)
                                }
                            } else {
                                console.log("Error moving file:", error);
                                toast.error("Failed to move item. Please try again.")
                            }
                        } finally {
                            setMoving(false)
                        }
                    }}>{moving ? <Spinner/> : <><FolderInput/> Move here</>}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <CreateFolderDialog open={createFolderOpen} setOpen={setCreateFolderOpen} nests={nests}/>
    </FileBrowserProvider>
}