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
import { Notebook } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";
import deleteChat from "../../../lib/actions/chat/deleteChat";

export function DeleteChatDialog({chatId, open, onOpenChange, onSubmit}: {chatId: string, open: boolean, onOpenChange: (open: boolean) => void, onSubmit: () => void}) {
    const [isDeleting, setIsDeleting] = useState(false);
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
                            onSubmit()
                        } catch (error) {
                            console.log("Error deleting chat:", error);
                            toast.error("Failed to delete chat. Please try again.")
                        } finally {
                            onOpenChange(false);
                            setIsDeleting(false);
                        }
                    }}>{isDeleting ? <Spinner/> : "Delete"}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
