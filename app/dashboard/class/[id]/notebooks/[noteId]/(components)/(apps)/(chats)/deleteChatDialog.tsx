'use client';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import deleteUserFile from "@/lib/r2actions/files/deleteUserFile";
import deleteUserFolder from "@/lib/r2actions/folders/deleteUserFolder";
import revalidateData from "@/lib/r2actions/revalidateData";
import { FileX, FolderX, Notebook } from "lucide-react"
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import deleteChat from "./deleteChat";

export function DeleteNotebookDialog({chatId, open, onOpenChange, onSubmit}: {chatId: string, open: boolean, onOpenChange: (open: boolean) => void, onSubmit: () => void}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const pathname = usePathname();
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Notebook/>
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this chat and all its attachments.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} onClick={(e)=> e.stopPropagation()} variant="outline">Cancel</AlertDialogCancel>
                    <Button disabled={isDeleting} variant="destructive" onClick={async (e)=>{
                        e.stopPropagation();
                        setIsDeleting(true);
                        try {
                            await deleteChat(chatId);
                        } catch (error) {
                            console.log("Error deleting chat:", error);
                            toast.error("Failed to delete chat. Please try again.")
                            onSubmit()
                            onOpenChange(false);
                        } finally {
                            setIsDeleting(false);
                        }
                    }}>{isDeleting ? <Spinner/> : "Delete"}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
