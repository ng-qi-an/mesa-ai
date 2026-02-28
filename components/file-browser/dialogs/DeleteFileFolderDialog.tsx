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
import { FileX, FolderX } from "lucide-react"
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteFileFolderDialog({isFolder, count, itemId, parent, open, onOpenChange}: {isFolder: boolean, count?: number, itemId: string, parent?: string, open: boolean, onOpenChange: (open: boolean) => void}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const pathname = usePathname();
    const { revalidateData } = useFileBrowser();
    
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        {isFolder ? <FolderX /> : <FileX/>}
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete {isFolder ? "folder" : "file"}?</AlertDialogTitle>
                    <AlertDialogDescription>
                         {isFolder ? (count ? `This will permanently delete this folder and all ${count - 1} items within it.` : ".") : "This removes your file from all notebooks, flashcards and quizzes etc."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} onClick={(e)=> e.stopPropagation()} variant="outline">Cancel</AlertDialogCancel>
                    <Button disabled={isDeleting} variant="destructive" onClick={async (e)=>{
                        e.stopPropagation();
                        setIsDeleting(true);
                        try {
                            if (isFolder){
                                await deleteUserFolder(itemId, true);
                            } else {
                                await deleteUserFile(itemId, parent || "");
                            }
                        } catch (error) {
                            console.log("Error deleting item:", error);
                            toast.error("Failed to delete item. Please try again.")
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
