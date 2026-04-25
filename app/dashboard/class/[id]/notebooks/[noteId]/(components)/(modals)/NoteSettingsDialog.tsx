import { useNotebook } from "@/components/providers/notebook-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { buildNotesUpdatePrompt, useGenerateNotes } from "../../(actions)/generateNotes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import SaveToNotebook from "../../(actions)/saveToNotebook";

export default function NoteSettingsDialog({open, onOpenChange}: {open: boolean, onOpenChange: (open: boolean) => void}){
    const noteCtx = useNotebook();
    const [topicWeights, setTopicWeights] = useState<Record<string, number>>({});
    const [instructions, setInstructions] = useState<string>("");
    const [length, setLength] = useState<string>("balanced");
    const { generateNotes } = useGenerateNotes();
    useEffect(()=>{
        console.log("Updating topic weights in NoteSettings: ", noteCtx?.topicWeights);
        setTopicWeights({...noteCtx?.topicWeights});
        setInstructions(noteCtx?.instructions || "");
        setLength(noteCtx?.length || "balanced");
    }, [noteCtx?.topicWeights, noteCtx?.instructions, noteCtx?.length])
    useEffect(()=>{
        console.log("Meta object changed in NoteSettings: ", noteCtx?.metaObject);
    }, [noteCtx.metaObject])
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className=" h-[calc(100%-2rem)] md:max-h-[800px] sm:max-w-[calc(100%-2rem)] md:max-w-3xl lg:max-w-3xl flex flex-col">
            <DialogHeader>
                <DialogTitle>Note Settings</DialogTitle>
                <DialogDescription>Configure your note preferences and options here.</DialogDescription>
            </DialogHeader>
            <div className="overflow-auto no-scrollbar h-full">
                <Field className="mt-4">
                    <FieldLabel>Custom instructions</FieldLabel>
                    <FieldDescription>Specify a topic, or custom concept you want to focus on.</FieldDescription>
                    <Textarea className="h-20 resize-none" placeholder="Text goes here!" value={instructions} onChange={(e) => setInstructions(e.target.value)}></Textarea>
                </Field>
                <FieldSet className="w-full mt-8">
                    <FieldLegend>Note length</FieldLegend>
                    <FieldDescription>Customise the length for your use case.</FieldDescription>
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
                <FieldSet className="mt-8">
                    <FieldLegend>Topic weights</FieldLegend>
                    <FieldDescription>Customise how much of each topic appears from 1-100.</FieldDescription>
                    <FieldGroup className="gap-4">
                        {topicWeights && Object.keys(topicWeights).map((topic) => (
                            <div className="w-full gap-4 flex flex-col sm:flex-row items-center" key={topic}>
                                <Input placeholder="Topic name" className="w-full min-w-[250px] md:min-w-[300px]" value={topic} onChange={(e) => {
                                    const newTopic = e.target.value;
                                    setTopicWeights((prev) => {
                                        const updatedWeights: Record<string, number> = {};
                                        Object.keys(prev).forEach((key) => {
                                            if (key === topic) {
                                                updatedWeights[newTopic] = prev[key];
                                            } else {
                                                updatedWeights[key] = prev[key];
                                            }
                                        });
                                        return updatedWeights;
                                    })
                                }} />
                                <div className="w-full bg-border h-[1px] hidden sm:block"/>
                                <div className="flex items-center w-full sm:w-max gap-4">
                                    <p className="ml-auto min-w-max text-right text-muted-foreground">0</p>
                                    <Slider
                                        value={[topicWeights[topic]]}
                                        onValueChange={(value) => setTopicWeights((prev) => ({
                                            ...prev,
                                            [topic]: value[0]
                                        }))}
                                        max={100}
                                        min={0}
                                        step={5}
                                        className="w-full min-w-[200px]"
                                        aria-label="Price Range"
                                    />
                                    <p className="min-w-7">{topicWeights[topic]}</p>
                                </div>
                                <Separator orientation="horizontal" className="block sm:hidden mb-5"/>
                            </div>
                        ))}
                    </FieldGroup>
                </FieldSet>
            </div>
            <DialogFooter>
                <Button variant="destructive" className="mr-auto" onClick={async() => {
                    onOpenChange(false);
                    noteCtx.setMetaObject(undefined);
                    noteCtx.setNotesHistory([]);
                    noteCtx.setTopicWeights({});
                    noteCtx.setInstructions("");
                    noteCtx.setCollapseSections(true);
                    noteCtx.setLength("balanced");
                    await SaveToNotebook(noteCtx.noteId, {content: null, title: null, subtitle: null, instructions: null, topicWeights: null});
                }}>Clear notes</Button>
                <Button variant="outline" onClick={() => {
                    onOpenChange(false)
                    setTopicWeights({...noteCtx?.topicWeights});
                    setLength(noteCtx?.length || "balanced");
                    setInstructions(noteCtx?.instructions || "");
                }}>Cancel</Button>
                <Button onClick={async() => {
                    onOpenChange(false);
                    noteCtx?.setTopicWeights(topicWeights);
                    noteCtx?.setInstructions(instructions);
                    noteCtx?.setLength(length);
                    await SaveToNotebook(noteCtx.noteId, {instructions: instructions || undefined, length: length || undefined});
                    await generateNotes({instructions: buildNotesUpdatePrompt({
                        topicWeights: topicWeights,
                        length: length,
                        instructions: instructions,
                    }), topicWeights: topicWeights});
                }}>Save settings</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

}