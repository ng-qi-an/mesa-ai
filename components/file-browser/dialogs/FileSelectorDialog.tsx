'use client';
import { FileBrowserProvider } from "@/components/providers/file-browser-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FileSelect } from "@/lib/schemas/schema";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import FileBrowser from "../FileBrowser";
import { FileBrowserItem } from "../FileBrowserColumns";
import FileBrowserBreadcrumbs from "../FileBrowserBreadcrumbs";
import { useClass } from "@/components/providers/class-provider";
import revalidateBrowserInnerAction from "./revalidateMoveAction";
import CreateNewButton from "../CreateNewButton";
import { useNextStep } from "nextstepjs";

export default function FileSelectorDialog({ open, setOpen, onConfirm }: { open: boolean, setOpen: (open: boolean) => void, onConfirm: (files: FileBrowserItem[]) => void }) {
    const [nests, setNests] = useState<FileSelect[]>([]);
    const [files, setFiles] = useState<FileBrowserItem[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileBrowserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const {currentTour, setCurrentStep} = useNextStep();
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
            if (!x && currentTour == "onboarding"){
                return
            }
            if (!x){
                setNests([]);
                setSelectedFiles([]);
            }
            setOpen(x)
        }}>
            <DialogContent id="fileSelectorDialog" className="sm:max-w-2xl h-full max-h-[95vh] sm:h-max flex flex-col">
                <DialogHeader className="h-max">
                    <DialogTitle>Mesa Drive</DialogTitle>
                    <DialogDescription>Select files from Mesa Drive to add.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col overflow-auto w-full h-full sm:h-max">
                    <div className="flex items-center justify-between">
                        <FileBrowserBreadcrumbs nests={nests} setNests={setNests} classNames={{page: 'font-medium text-base', link: 'text-base'}}/>
                        <CreateNewButton nests={nests}>
                            <Button variant={'outline'} size="sm">
                                Create new
                                <ChevronDown className="ml-1"/>
                            </Button>
                        </CreateNewButton>
                    </div>
                    {loading ? 
                        <div className="flex items-center justify-center w-full py-13"><Spinner className="text-2xl"/></div>
                    : <>                   
                        <div className="flex w-full overflow-auto mt-3">
                            <FileBrowser selected={selectedFiles.map(f=>f.id)} className="w-full" files={files} hideColumns={["dateModified"]} enableCheckbox onItemSelect={(file) => {
                                if (file.contentType == "application/x-directory") {
                                    setNests([...nests, file])
                                } else {
                                    if (selectedFiles.some(f=>f.id == file.id)){
                                        setSelectedFiles(selectedFiles.filter(f=>f.id != file.id && f.contentType != "application/x-directory"));
                                    } else {
                                        setSelectedFiles([...selectedFiles.filter(f=>f.contentType != "application/x-directory"), file]);
                                    }
                                }
                            }}/>
                        </div>
                    </>
                    }
                </div>
                <DialogFooter className="flex-col h-max">
                    <Button variant="outline" onClick={()=> currentTour != "onboarding" && setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={selectedFiles.length === 0} onClick={()=> {
                        if (currentTour == "onboarding"){
                            setCurrentStep(9, 100);
                        }
                        onConfirm(selectedFiles)
                    }}>{selectedFiles.length === 0 ? "Select files" : `Select ${selectedFiles.length} file${selectedFiles.length != 1 ? "s" : ""}`}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </FileBrowserProvider>
}