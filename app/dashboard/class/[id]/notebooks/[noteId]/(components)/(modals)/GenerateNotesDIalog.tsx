import { useNotebook } from "@/components/providers/notebook-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useGenerateMeta } from "../../(actions)/useGenerateMeta";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNextStep } from "nextstepjs";
import GenerateNotesDialogContent from "./GenerateNotesDialogContent";

export default function GenerateNotesDialog(){
    const noteCtx = useNotebook();
    const {generateMeta} = useGenerateMeta();
    const [instructions, setInstructions] = useState(noteCtx?.instructions || "");
    const [length, setLength] = useState(noteCtx?.length || "balanced");
    const {currentTour, setCurrentStep} = useNextStep();

    return noteCtx && <Dialog open={noteCtx?.showGenerateNotesDialog} onOpenChange={(open) => {
            if (!open && currentTour == "onboarding"){
                return
            }    
            noteCtx?.setShowGenerateNotesDialog(open)
        }}>
        <DialogContent id="generateNotesDialog" showCloseButton={false}>
            <DialogHeader>
                <DialogTitle>Generate notes</DialogTitle>
                <DialogDescription>Customise the length for your use case.</DialogDescription>
            </DialogHeader>
            <GenerateNotesDialogContent length={length} setLength={setLength} instructions={instructions} setInstructions={setInstructions}/>
            <DialogFooter>
                <Button onClick={()=> currentTour != "onboarding" && noteCtx?.setShowGenerateNotesDialog(false)} variant={'ghost'}>
                    Cancel
                </Button>
                <Button disabled={noteCtx.files.length < 1} variant={"raised"} onClick={async()=>{
                        noteCtx.setInstructions(instructions);
                        noteCtx.setLength(length);
                        noteCtx.setShowGenerateNotesDialog(false);
                        generateMeta({instructions, files: noteCtx.files, length});
                        if (currentTour == "onboarding"){
                            setCurrentStep(11);
                        }
                }}>
                    Generate now
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}