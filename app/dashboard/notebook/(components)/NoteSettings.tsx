import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { NotebookContext } from "@/lib/contexts";
import { useContext, useEffect, useState } from "react";

export default function NoteSettings({open, onOpenChange}: {open: boolean, onOpenChange: (open: boolean) => void}){
    const noteCtx = useContext(NotebookContext);
    const [topicWeights, setTopicWeights] = useState<Record<string, number>>({});
    const [instructions, setInstructions] = useState<string>("");
    useEffect(()=>{
        console.log("Updating topic weights in NoteSettings: ", noteCtx?.topicWeights);
        setTopicWeights({...noteCtx?.topicWeights});
        setInstructions(noteCtx?.instructions || "");
    }, [noteCtx?.topicWeights])
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className=" h-[calc(100%-2rem)] md:max-h-[800px] sm:max-w-[calc(100%-2rem)] md:max-w-3xl lg:max-w-3xl">
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
                <Button variant="outline" onClick={() => {
                    onOpenChange(false)
                    setTopicWeights({...noteCtx?.topicWeights});
                    setInstructions(noteCtx?.instructions || "");
                }}>Cancel</Button>
                <Button onClick={() => {
                    onOpenChange(false);
                    noteCtx?.setTopicWeights(topicWeights);
                    noteCtx?.setInstructions(instructions);
                    noteCtx?.generateNotes(instructions, noteCtx.files, topicWeights, noteCtx.cache);
                }}>Save settings</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

}