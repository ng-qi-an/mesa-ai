'use client';
import { FileBrowserProvider, useFileBrowser } from "@/components/providers/file-browser-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import addUserFolder from "@/lib/r2actions/folders/addUserFolder";
import { FileSelect } from "@/lib/schemas/schema";
import { FolderInput, FolderPlus, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FileBrowser from "../FileBrowser";
import { FileBrowserItem } from "../FileBrowserColumns";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FileBrowserBreadcrumbs from "../FileBrowserBreadcrumbs";
import { allowedMimeTypes } from "@/lib/utils";
import moveUserFile from "@/lib/r2actions/files/moveUserFile";
import { useClass } from "@/components/providers/class-provider";
import CreateFolderDialog from "./CreateFolderDialog";
import revalidateBrowserInnerAction from "./revalidateMoveAction";

export default function FileSelectorDialog({ open, setOpen, onConfirm }: { open: boolean, setOpen: (open: boolean) => void, onConfirm: (files: FileBrowserItem[]) => void }) {
    const pathname = usePathname()
    const [nests, setNests] = useState<FileSelect[]>([]);
    const [files, setFiles] = useState<FileBrowserItem[]>([]);
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileBrowserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { _class } = useClass();

    useEffect(()=>{
        async function fetchData(nests: FileSelect[]) {
            const r = await revalidateBrowserInnerAction(nests, _class.id)
            setFiles(r.map((f)=> ({...f, key: f.id})))
            setLoading(false);
        }
        if (open){
            setLoading(true);
            fetchData(nests);
        } else {
            setSelectedFiles([]);
        }
    }, [open, nests])
    return <FileBrowserProvider nests={nests} setNests={setNests} files={files} 
        revalidateData={async()=> {
            const r = await revalidateBrowserInnerAction(nests, _class.id)
            setFiles(r.map((f)=> ({...f, key: f.id})))
        }
    }> 
        <Dialog open={open} onOpenChange={(x)=>{
            if (!x){
                setNests([]);
                setSelectedFiles([]);
            }
            setOpen(x)
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mesa Drive</DialogTitle>
                    <DialogDescription>Select files from Mesa Drive to add.</DialogDescription>
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
                            <FileBrowser selected={selectedFiles.map(f=>f.id)} className="w-full" files={files} hideColumns={["dateModified"]} enableCheckbox onItemSelect={(file) => {
                                if (file.contentType != "application/x-directory") {
                                    if (selectedFiles.some(f=>f.id == file.id)){
                                        setSelectedFiles(selectedFiles.filter(f=>f.id != file.id && f.contentType != "application/x-directory"));
                                    } else {
                                        setSelectedFiles([...selectedFiles.filter(f=>f.contentType != "application/x-directory"), file]);
                                    }
                                }
                            }} onSecondaryItemSelect={async (file)=>{
                                if (file.contentType == "application/x-directory") {
                                    setNests([...nests, file])
                                }
                            }}/>
                        </div>
                    </>
                    }
                </div>
                <DialogFooter className="flex-col">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={loading} onClick={()=> onConfirm(selectedFiles)}>Select {selectedFiles.length} file{selectedFiles.length != 1 ? "s" : ""}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <CreateFolderDialog open={createFolderOpen} setOpen={setCreateFolderOpen} nests={nests}/>
    </FileBrowserProvider>
}