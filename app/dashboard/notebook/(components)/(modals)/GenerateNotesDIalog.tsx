import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { NotebookContext } from "@/lib/contexts";
import { useContext, useState } from "react";

export default function GenerateNotesDialog(){
    const noteCtx = useContext(NotebookContext);
    const [instructions, setInstructions] = useState(noteCtx?.instructions || "");

    return noteCtx && <Dialog open={noteCtx?.showGenerateNotesDialog} onOpenChange={(open) => noteCtx?.setShowGenerateNotesDialog(open)}>
        <DialogContent showCloseButton={false}>
            <DialogHeader>
                <DialogTitle>Custom instructions</DialogTitle>
                <DialogDescription>
                    Specify a topic, or custom concept you want to focus on in your notes. (Optional)
                </DialogDescription>
            </DialogHeader>
            <Textarea className="h-20 resize-none" placeholder="Make my notes more focused on..." value={instructions} onChange={(e) => setInstructions(e.target.value)}></Textarea>
            <DialogFooter>
                <Button onClick={()=> noteCtx?.setShowGenerateNotesDialog(false)} variant={'ghost'}>
                    Cancel
                </Button>
                <Button disabled={noteCtx.files.length < 1} variant={"raised"} onClick={async()=>{
                        noteCtx.setInstructions(instructions);
                        noteCtx.setShowGenerateNotesDialog(false);
                        noteCtx.generateMeta(instructions, noteCtx.files);
                }}>
                    Generate now
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}