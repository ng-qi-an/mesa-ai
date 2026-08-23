import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { ArrowRight, ChevronLeft, PenLine, Sparkles } from "lucide-react";
import { useState } from "react";
import { addNotebookFiles } from "../../(actions)/addNotebookFiles";
import { useNotebook } from "@/components/providers/notebook-provider";
import FileSelectorDialog from "@/components/file-browser/dialogs/FileSelectorDialog";
import GenerateNotesDialogContent from "./GenerateNotesDialogContent";
import saveToNotebook from "../../(actions)/saveToNotebook";
import { useGenerateNotes } from "../../(actions)/generateNotes";

export default function NewNotebookDialog(){
    const [choice, setChoice] = useState("generate");
    const [showFileSelector, setShowFileSelector] = useState(false);
    const [pickedFiles, setPickedFiles] = useState(false);
    const [length, setLength] = useState("balanced");
    const [instructions, setInstructions] = useState("");
    const noteCtx = useNotebook();
    const { generateNotes } = useGenerateNotes();
    return <>
        <FileSelectorDialog open={showFileSelector} setOpen={setShowFileSelector} onConfirm={async(files) => {
            const finalFiles = files.filter((file)=> noteCtx.files.every((f) => f.id !== file.id))
            if (finalFiles.length === 0){
                setShowFileSelector(false);
                return;
            }
            noteCtx.setFiles((x) => [...finalFiles]);
            await addNotebookFiles(noteCtx.noteId, finalFiles.map(f=>f.id));
            setShowFileSelector(false);
            setPickedFiles(true);
        }}/>
        <Dialog open={noteCtx.showNotebookCreate} onOpenChange={()=>{}}>
            <DialogContent showCloseButton={false} className={`${!pickedFiles && "lg:max-w-[600px]" } transition-300 w-full`}>
                <DialogHeader>
                    <DialogTitle>{!pickedFiles ? "New Notebook" : "Generate notes"}</DialogTitle>
                    <DialogDescription>{!pickedFiles ? "Choose how you want to start." : "Customise the length for your use case."}</DialogDescription>
                </DialogHeader>
                {!pickedFiles ? <div className="grid grid-cols-2 gap-4">
                    <button className={`flex flex-col items-start p-4 transition-all active:scale-95 ${choice === "write" ? "border border-primary bg-secondary/50 " : "hover:bg-card border"} rounded-lg`} onClick={() => setChoice("write")}>
                        <PenLine className="size-7" strokeWidth={2} />
                        <p className="mt-3 font-semibold">Write myself</p>
                        <p className="text-muted-foreground text-sm mt-1 text-left">
                            Start on a blank editor, and type your own notes.
                        </p>
                    </button>
                    <button className={`flex flex-col items-start p-4 transition-all active:scale-95 rounded-lg ${choice === "generate" ? "border border-primary bg-secondary/50 " : "hover:bg-card border"}`} onClick={() => setChoice("generate")}>
                        <Sparkles className="size-7" strokeWidth={2} />
                        <p className="mt-3 font-semibold">Generate notes</p>
                        <p className="text-muted-foreground text-sm mt-1 text-left">
                            Mesa AI will generate notes for you based on your files.
                        </p>
                    </button>
                </div> : <GenerateNotesDialogContent length={length} setLength={setLength} instructions={instructions} setInstructions={setInstructions}/>}
                <DialogFooter>
                    {!pickedFiles ? <Field orientation="horizontal">
                        <Checkbox disabled={choice == "generate"} id="dont-show-start-again"></Checkbox>
                        <FieldLabel htmlFor="dont-show-start-again">Don't show this again</FieldLabel>
                    </Field> : <Button className="mr-auto" variant="secondaryRaised" onClick={() => {
                        setPickedFiles(false);
                        noteCtx.setFiles([]);
                        noteCtx.setShowNotebookCreate(false);
                    }}>
                        <ChevronLeft/>
                        Return to options
                    </Button>}
                    <Button variant="raised" onClick={()=>{
                        if (pickedFiles){
                            noteCtx.setInstructions(instructions);
                            noteCtx.setLength(length);
                            generateNotes({instructions, length});
                            noteCtx.setShowNotebookCreate(false);
                        } else if (choice === "generate"){
                            setShowFileSelector(true);
                        } else if (choice === "write"){
                            noteCtx.setShowNotebookCreate(false);
                            saveToNotebook(noteCtx.noteId, {showNotebookCreate: false});
                        }
                    }}>
                        Continue
                        <ArrowRight/>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
}