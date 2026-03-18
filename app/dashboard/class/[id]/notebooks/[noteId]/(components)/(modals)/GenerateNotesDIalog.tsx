import { useNotebook } from "@/components/providers/notebook-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useContext, useState } from "react";
import { useGenerateMeta } from "../../(actions)/useGenerateMeta";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function GenerateNotesDialog(){
    const noteCtx = useNotebook();
    const {generateMeta} = useGenerateMeta();
    const [instructions, setInstructions] = useState(noteCtx?.instructions || "");
    const [length, setLength] = useState(noteCtx?.length || "balanced");

    return noteCtx && <Dialog open={noteCtx?.showGenerateNotesDialog} onOpenChange={(open) => noteCtx?.setShowGenerateNotesDialog(open)}>
        <DialogContent showCloseButton={false}>
            <DialogHeader>
                <DialogTitle>Generate notes</DialogTitle>
                <DialogDescription>Customise the length for your use case.</DialogDescription>
            </DialogHeader>
            <div className="overflow-auto no-scrollbar h-full">
                <FieldSet className="w-full">
                    <RadioGroup value={length} onValueChange={(value) => setLength(value)} className="w-full max-w-full">
                        <FieldLabel htmlFor="concise">
                            <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Concise</FieldTitle>
                                <FieldDescription>
                                    Concise summary for quicker reading.
                                </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value="concise" id="concise" />
                            </Field>
                        </FieldLabel>
                        <FieldLabel htmlFor="balanced">
                            <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Balanced</FieldTitle>
                                <FieldDescription>Short read with more key points and definitions.</FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value="balanced" id="balanced" />
                            </Field>
                        </FieldLabel>
                        <FieldLabel htmlFor="detailed">
                            <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Detailed</FieldTitle>
                                <FieldDescription>Comprehensive overview with more explanations.</FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value="detailed" id="detailed" />
                            </Field>
                        </FieldLabel>
                    </RadioGroup>
                </FieldSet>
                <Field className="mt-4">
                    <FieldLabel>Custom instructions (optional)</FieldLabel>
                    <FieldDescription>Specify a topic, or custom concept you want to focus on.</FieldDescription>
                    <Textarea className="h-20 resize-none" placeholder="Make my notes more focused on a specific topic..." value={instructions} onChange={(e) => setInstructions(e.target.value)}></Textarea>
                </Field>
            </div>
            <DialogFooter>
                <Button onClick={()=> noteCtx?.setShowGenerateNotesDialog(false)} variant={'ghost'}>
                    Cancel
                </Button>
                <Button disabled={noteCtx.files.length < 1} variant={"raised"} onClick={async()=>{
                        noteCtx.setInstructions(instructions);
                        noteCtx.setLength(length);
                        noteCtx.setShowGenerateNotesDialog(false);
                        generateMeta({instructions, files: noteCtx.files, length});
                }}>
                    Generate now
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}