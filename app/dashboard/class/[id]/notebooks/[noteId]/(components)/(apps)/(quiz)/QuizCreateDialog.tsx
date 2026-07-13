import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Check } from "lucide-react";
import { useRef, useState } from "react";
import { useNotebook } from "@/components/providers/notebook-provider";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { quizQuestionTypes } from "@/lib/actions/quiz/quizQuestionTypes";
import createQuiz from "@/lib/actions/quiz/createQuiz";
import { Spinner } from "@/components/ui/spinner";
import { useClass } from "@/components/providers/class-provider";
import { QuizSelect } from "@/lib/schemas/schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function QuizCreateDialog({ open, setOpen, onCreated }: { open: boolean, setOpen: (open: boolean) => void, onCreated(quizId: QuizSelect): void }) {
    const noteCtx = useNotebook();
    const { _class } = useClass();
    const { id } = useParams();
    const [creating, setCreating] = useState(false);
    const dialogContentRef = useRef<HTMLDivElement | null>(null);
    const [name, setName] = useState("");
    const [selectedTopics, setSelectedTopics] = useState<string[]>(Object.keys(noteCtx.topicWeights));
    const [focusTopicCombobox, setFocusTopicCombobox] = useState(false);
    const [topicComboboxInputValue, setTopicComboboxInputValue] = useState("");
    const [difficulty, setDifficulty] = useState("normal");
    const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<(typeof quizQuestionTypes)[number][]>(quizQuestionTypes);
    const [length, setLength] = useState("medium");
    const [instructions, setInstructions] = useState("");

    async function createHandler(){
        setCreating(true);
        console.log("Creating a quiz!!")
        try {
            const result = await createQuiz(id as string, {noteId: noteCtx.noteId!, subject: _class.subject, fileIds: noteCtx.files.map((f) => f.id), name, topics: selectedTopics, difficulty, questionTypes: selectedQuestionTypes.map((t) => t.value), length, instructions});
            console.log("Created quiz:", result);
            onCreated(result[0]);
        } catch (error) {
            toast.error("Failed to create quiz. Please try again.")
        } finally {
            setCreating(false);
        }
    }
    return <Dialog open={open} onOpenChange={!creating ? setOpen : undefined}>
        <DialogContent ref={dialogContentRef} className="sm:max-w-2xl h-full max-h-[95vh] sm:h-max flex flex-col">
            <DialogHeader>
                <DialogTitle>Create Quiz</DialogTitle>
                <DialogDescription>Tailor your new quiz to your preferences.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e)=>{
                e.preventDefault();
                console.log("Creating quiz with settings:", {name, selectedTopics, difficulty, selectedQuestionTypes, length, instructions});
                createHandler();
            }}>
                <div className="h-full px-1 mb-3 flex flex-col gap-4 overflow-auto">
                    <Separator className="my-0"/>
                    <div className="flex gap-4">
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input value={name} onChange={(e)=> setName(e.target.value)} placeholder="New Quiz"/>
                            <FieldDescription>Leave blank to auto-generate a name.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Topics</FieldLabel>
                            <Combobox required onOpenChange={(x)=> setFocusTopicCombobox(x)} inputValue={focusTopicCombobox ? topicComboboxInputValue : (selectedTopics.length == Object.keys(noteCtx.topicWeights).length ? "All" : selectedTopics.length == 0 ? "None" : `${selectedTopics.length} selected`)} onInputValueChange={setTopicComboboxInputValue} value={selectedTopics} onValueChange={setSelectedTopics} multiple autoHighlight defaultValue={Object.keys(noteCtx.topicWeights)} items={Object.keys(noteCtx.topicWeights)}>
                                <ComboboxInput aria-invalid={selectedTopics.length === 0} placeholder={(selectedTopics.length == Object.keys(noteCtx.topicWeights).length ? "All" : selectedTopics.length == 0 ? "None" : `${selectedTopics.length} selected`)} />
                                <ComboboxContent portalContainer={dialogContentRef.current ?? undefined}>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item}>
                                            {item}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            {selectedTopics.length === 0 ? <FieldError>At least 1 topic has to be selected.</FieldError> : <FieldDescription>Topics used for formulating quiz questions.</FieldDescription>}
                        </Field>
                    </div>
                    <Separator className="my-0"/>
                    <Field>
                        <FieldLabel>Question types</FieldLabel>
                        {selectedQuestionTypes.length === 0 ? <FieldError>At least 1 question type has to be selected.</FieldError> : <FieldDescription>Topics used for formulating quiz questions.</FieldDescription>}
                        <div className="flex flex-wrap">
                            {quizQuestionTypes.map((questionType)=>{
                            return <Tooltip key={questionType.value}>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant={selectedQuestionTypes.includes(questionType) ? "secondary" : "outline"} size="default" onClick={()=> setSelectedQuestionTypes(prev => prev.includes(questionType) ? prev.filter((v) => v !== questionType) : [...prev, questionType])} className="mr-2">
                                        {questionType.name}
                                        {selectedQuestionTypes.includes(questionType) && <Check className="size-4"/>}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{questionType.description}</p>
                                </TooltipContent>
                            </Tooltip>})}
                        </div>
                    </Field>
                    <Separator className="my-0"/>
                    <div className="grid gap-4 grid-cols-2">
                        <FieldSet>
                            <FieldLegend variant="label">Difficulty</FieldLegend>
                            <FieldDescription>Overall difficulty of quiz questions.</FieldDescription>
                            <div className="flex">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant={difficulty == "easier" ? "secondary" : "outline"} size="default" onClick={()=> setDifficulty("easier")} className="mr-2">
                                            Easier
                                            {difficulty == "easier" && <Check className="size-4"/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Basic questions with more MCQs.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant={difficulty == "normal" ? "secondary" : "outline"} size="default" onClick={()=> setDifficulty("normal")} className="mr-2">
                                            Normal
                                            {difficulty == "normal" && <Check className="size-4"/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Balance of basic and hard questions.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant={difficulty == "harder" ? "secondary" : "outline"} size="default" onClick={()=> setDifficulty("harder")}>
                                            Harder
                                            {difficulty == "harder" && <Check className="size-4"/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Challenging questions with more textual answers.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </FieldSet>
                        <FieldSet>
                            <FieldLegend variant="label">Length</FieldLegend>
                            <FieldDescription>Number of questions in the quiz.</FieldDescription>
                            <div className="flex">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant={length == "short" ? "secondary" : "outline"} size="default" onClick={()=> setLength("short")} className="mr-2">
                                            Short
                                            {length == "short" && <Check className="size-4"/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>7 questions - good for quick reviews.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant={length == "medium" ? "secondary" : "outline"} size="default" onClick={()=> setLength("medium")} className="mr-2">
                                            Medium
                                            {length == "medium" && <Check className="size-4"/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>12 questions - a standard quiz length.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant={length == "long" ? "secondary" : "outline"} size="default" onClick={()=> setLength("long")}>
                                            Long
                                            {length == "long" && <Check className="size-4"/>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>20 questions - for in-depth reviews.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </FieldSet>
                    </div>
                    <Separator className="my-0"/>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Custom Instructions</FieldLabel>
                            <Textarea value={instructions} onChange={(e)=> setInstructions(e.target.value)} className="h-[150px] resize-none" placeholder="E.g. 'Focus on dates and events' or 'Give me more explain questions'"/>
                            <FieldDescription>Optional instructions to guide quiz question generation.</FieldDescription>
                        </Field>
                    </FieldGroup>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button type="submit" disabled={creating}>Create quiz {creating ? <Spinner/> : <ArrowRight/>}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}