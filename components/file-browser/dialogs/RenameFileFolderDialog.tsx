'use client';
import { useFileBrowser } from "@/components/providers/file-browser-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import renameUserFile from "@/lib/r2actions/files/renameUserFile";
import addUserFolder from "@/lib/r2actions/folders/addUserFolder";
import { FileSelect } from "@/lib/schemas/schema";
import { FilePen, FolderPen, FolderPlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RenameFileFolderDialog({ open, setOpen, itemId, originalName, isFolder }: { open: boolean, setOpen: (open: boolean) => void, itemId: string, originalName: string, isFolder: boolean }) {
    const [renaming, setRenaming] = useState(false);
    const pathname = usePathname()
    const { revalidateData } = useFileBrowser();

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <form onSubmit={async(e)=>{
                e.preventDefault();
                const name = new FormData(e.currentTarget).get("name") as string;
                if (!name) {
                    return toast.warning("Please enter a new name.");
                }
                setRenaming(true);
                try {
                    await renameUserFile(itemId, "", name);
                    setOpen(false);
                    await revalidateData(pathname);
                } catch (error) {
                    if (error instanceof Error && error.message === "already_exists") {
                        return toast.error("An item with this name already exists.");
                    }
                    console.log("Error renaming item:", error);
                    toast.error("Failed to rename item. Please try again.")
                } finally {
                    setRenaming(false);
                }
            }} className="space-y-6">
                <DialogHeader>
                    <DialogTitle>Rename {isFolder ? "Folder" : "File"}</DialogTitle>
                    <DialogDescription>Change the name of this {isFolder ? "folder" : "file"}.</DialogDescription>
                </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Name</Label>
                            <Input id="name-1" required defaultValue={originalName} name="name" placeholder="New Folder" />
                        </Field>
                    </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                        <Button type="submit" disabled={renaming}>{renaming ? <Spinner/> : <>{isFolder ? <FolderPen/> : <FilePen/>} Rename {isFolder ? "folder" : "file"}</>}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}