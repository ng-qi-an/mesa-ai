'use client';
import { useClass } from "@/components/providers/class-provider";
import { useFileBrowser } from "@/components/providers/file-browser-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import addUserFolder from "@/lib/r2actions/folders/addUserFolder";
import { FileSelect } from "@/lib/schemas/schema";
import { FolderPlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateFolderDialog({ open, setOpen, nests }: { open: boolean, setOpen: (open: boolean) => void, nests: FileSelect[] }) {
    const [creating, setCreating] = useState(false);
    const pathname = usePathname()
    const {_class} = useClass();
    
    const { revalidateData } = useFileBrowser();
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <form onSubmit={async(e)=>{
                e.preventDefault();
                const name = new FormData(e.currentTarget).get("name") as string;
                if (!name) {
                    return toast.warning("Please enter a folder name.");
                }
                setCreating(true);
                try {
                    await addUserFolder(name, nests[nests.length - 1] ? nests[nests.length - 1].id : '', _class.id);
                    setOpen(false);
                    await revalidateData(pathname);
                } catch (error) {
                    if (error instanceof Error && error.message === "already_exists") {
                        return toast.error("A folder with this name already exists.");
                    }
                    console.log("Error creating folder:", error);
                    toast.error("Failed to create folder. Please try again.")
                } finally {
                    setCreating(false);
                }
            }} className="space-y-6">
                <DialogHeader>
                    <DialogTitle>Create Folder</DialogTitle>
                    <DialogDescription>Folders help to organise files into distinct sections.</DialogDescription>
                </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Name</Label>
                            <Input id="name-1" required name="name" placeholder="New Folder" />
                        </Field>
                    </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                        <Button type="submit" disabled={creating}>{creating ? <Spinner/> : <><FolderPlus/> Create folder</>}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}