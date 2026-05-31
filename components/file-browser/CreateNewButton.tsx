'use client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CloudUpload, FolderPlus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import CreateFolderDialog from "./dialogs/CreateFolderDialog";
import { FileSelect } from "@/lib/schemas/schema";
import { allowedFileTypesList, allowedMimeTypes } from "@/lib/utils";
import { toast } from "sonner";
import addUserFileClient from "@/lib/r2actions/files/addUserFileClient";
import { usePathname } from "next/navigation";
import getAddUserFileURL from "@/lib/r2actions/files/getAddUserFileUrl";
import { useFileBrowser } from "../providers/file-browser-provider";
import { useClass } from "../providers/class-provider";

export default function CreateNewButton({nests, children}: {nests: FileSelect[], children: React.ReactNode}) {
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const { revalidateData } = useFileBrowser();
    const {_class} = useClass();

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
                            const result = await addUserFileClient(filesArray, urls, nests[nests.length - 1] ? nests[nests.length - 1].id : '', _class.id);
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
            accept={allowedFileTypesList.join(",")}
            className='absolute right-4 opacity-0 pointer-events-none w-20'
        />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
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