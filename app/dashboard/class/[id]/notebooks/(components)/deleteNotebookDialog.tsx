'use client';
import { useFileBrowser } from "@/components/providers/file-browser-provider";
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
import revalidateData from "@/lib/actions/revalidateData";
import { FileX, FolderX, Notebook } from "lucide-react"
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteNotebook } from "../(actions)/deleteNotebook";

export function DeleteNotebookDialog({noteId, open, onOpenChange}: {noteId: string, open: boolean, onOpenChange: (open: boolean) => void}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const pathname = usePathname();
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Notebook/>
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete notebook?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this notebook and all its contents, along with flashcards, quizzes, and other associated Apps.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} onClick={(e)=> e.stopPropagation()} variant="outline">Cancel</AlertDialogCancel>
                    <Button disabled={isDeleting} variant="destructive" onClick={async (e)=>{
                        e.stopPropagation();
                        setIsDeleting(true);
                        try {
                            await deleteNotebook(noteId);
                        } catch (error) {
                            console.log("Error deleting notebook:", error);
                            toast.error("Failed to delete notebook. Please try again.")
                        } finally {
                            setIsDeleting(false);
                            onOpenChange(false);
                            await revalidateData(pathname);
                        }
                    }}>{isDeleting ? <Spinner/> : "Delete"}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
