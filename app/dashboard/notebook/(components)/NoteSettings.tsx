import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NotebookContext } from "@/lib/contexts";
import { useContext } from "react";

export default function NoteSettings({open, onOpenChange}: {open: boolean, onOpenChange: (open: boolean) => void}){
    const noteCtx = useContext(NotebookContext);
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Note Settings</DialogTitle>
                <DialogDescription>Configure your note preferences and options here.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={() => {
                    onOpenChange(false);
                    noteCtx?.setNoteContent(null);
                    noteCtx?.generateNotes(noteCtx.instructions, noteCtx.files, noteCtx.topicWeights);
                }}>Save settings</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

}