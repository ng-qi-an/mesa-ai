'use client';
import { useFileBrowser } from "@/components/providers/file-browser-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import renameUserFile from "@/lib/r2actions/files/renameUserFile";
import { Pen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import renameChat from "./renameChat";

export default function RenameChatDialog({ open, setOpen, chatid, initialName, onSubmit }: { open: boolean, setOpen: (open: boolean) => void, chatid: string, initialName: string, onSubmit: (newName: string) => void }) {
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
                    await renameChat(chatid, name);
                    setOpen(false);
                    onSubmit(name);
                } catch (error) {
                    console.log("Error renaming chat:", error);
                    toast.error("Failed to rename chat. Please try again.")
                } finally {
                    setRenaming(false);
                }
            }} className="space-y-6">
                <DialogHeader>
                    <DialogTitle>Rename Chat</DialogTitle>
                    <DialogDescription>Change the name of this chat.</DialogDescription>
                </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Name</Label>
                            <Input id="name-1" required defaultValue={initialName} name="name" placeholder="New Chat Name" />
                        </Field>
                    </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                        <Button type="submit" disabled={renaming}>{renaming ? <Spinner/> : <><Pen/> Rename Chat</>}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}