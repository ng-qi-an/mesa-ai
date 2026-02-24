'use client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, CloudUpload, FolderPlus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import CreateFolderDialog from "./CreateFolderDialog";
import { FileSelect } from "@/lib/schemas/schema";
import { allowedMimeTypes } from "@/lib/utils";
import { toast } from "sonner";
import addUserFileClient from "@/lib/r2actions/files/addUserFileClient";
import revalidateData from "@/lib/r2actions/revalidateData";
import { usePathname } from "next/navigation";
import getAddUserFileURL from "@/lib/r2actions/files/getAddUserFileUrl";

export default function CreateNewButton({nests}: {nests: FileSelect[]}) {
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();

    return <>
        <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={async(e)=>{
                if (e.target.files) {
                    const filesArray = Array.from(e.target.files)
                    console.log("Files uploaded:", filesArray)
                    const myPromise = new Promise<{ files: any[] }>(async (resolve, reject) => {
                        try {
                            const urls = await getAddUserFileURL(filesArray.map((file)=> ({ name: file.name, type: file.type })));
                            console.log("urls", urls)
                            const result = await addUserFileClient(filesArray, urls, nests[nests.length - 1] ? nests[nests.length - 1].id : '');
                            console.log("result", result)
                            if (result.every(r=> !r || r.status === "uploaded")){
                                resolve({ files: result });
                            } else {
                                reject("Some files failed to upload");
                            }
                            console.log("File upload result:", result);
                            fileInputRef.current!.value = "";
                        } catch (error) {
                            reject("Error uploading files:" + error);
                        }
                    });
                    toast.promise(myPromise, {
                        loading: "Uploading files...",
                        success: async(data: { files: any[] }) => {
                            await revalidateData(pathname)
                            return `${data.files.length} files uploaded successfully`;
                        },
                        error: async (e) => {
                            await revalidateData(pathname)
                            return `Error uploading files: ${e}`;
                        },
                    })
                }
            }}
            accept={allowedMimeTypes.join(",")}
            className='absolute right-4 opacity-0 pointer-events-none w-20'
        />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'secondary'} className="ml-auto absolute right-6 z-10">
                    Create new
                    <ChevronDown/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-max" align="end">
                <DropdownMenuItem onClick={()=> fileInputRef.current?.click()}>
                    <Upload/>
                    Upload file
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CloudUpload/>
                    Google Drive
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={()=> setCreateFolderOpen(true)}>
                    <FolderPlus/>
                    Add folder
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <CreateFolderDialog open={createFolderOpen} setOpen={setCreateFolderOpen} nests={nests}/>
    </>
}