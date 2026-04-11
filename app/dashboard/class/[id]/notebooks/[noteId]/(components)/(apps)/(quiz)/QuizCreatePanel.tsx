'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Fragment, useState } from "react";
import { useNotebook } from "@/components/providers/notebook-provider";
import { QuizSelect } from "@/lib/schemas/schema";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { quizQuestionTypes } from "@/lib/actions/quiz/quizQuestionTypes";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import createQuiz from "@/lib/actions/quiz/createQuiz";
import { Spinner } from "@/components/ui/spinner";
import { useClass } from "@/components/providers/class-provider";
export default function QuizCreatePanel({quizList, setQuizList, setSelectedQuizId}: {quizList: QuizSelect[], setQuizList: (quizzes: QuizSelect[]) => void, setSelectedQuizId: (id: string) => void}){
    const noteCtx = useNotebook();
    const { _class } = useClass();
    const { id } = useParams();
    const [creating, setCreating] = useState(false);
    const anchor = useComboboxAnchor();
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
        try {
            const result = await createQuiz(id as string, {noteId: noteCtx.noteId!, fileStoreId: _class.fileStoreId!, fileIds: noteCtx.files.map((f) => f.id), name, topics: selectedTopics, difficulty, questionTypes: selectedQuestionTypes.map((t) => t.value), length, instructions});
            console.log("Created quiz:", result);
            setQuizList([...result, ...quizList]);
            setSelectedQuizId(result[0].id);
        } catch (error) {
            toast.error("Failed to create quiz. Please try again.")
        } finally {
            setCreating(false);
        }
    }

    return <Card size="sm" className={`rounded-md  ring-neutral-200 dark:ring-neutral-900 h-full`}>
        <CardHeader className="items-center group flex cursor-pointer relative">
            <div className="flex w-full items-center gap-1" onClick={()=> setSelectedQuizId("")}>
                <ChevronLeft className="text-muted-foreground group-hover:text-foreground size-4"/>
                <CardTitle 
                className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                    Create quiz
                </CardTitle>
            </div>
        </CardHeader>
        <form onSubmit={(e)=>{
            e.preventDefault();
            console.log("Creating quiz with settings:", {name, selectedTopics, difficulty, selectedQuestionTypes, length, instructions});
            createHandler();
        }}  className="flex-1 flex flex-col min-h-0 h-full">
            <Separator className="mb-2" />
            <div className="h-full px-4 mb-3 flex flex-col p-5 overflow-auto">
                <FieldSet>
                    <FieldLegend>Quiz details</FieldLegend>
                    <FieldDescription>Tailor your new quiz to your preferences.</FieldDescription>
                    <FieldSeparator/>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input value={name} onChange={(e)=> setName(e.target.value)} placeholder="New Quiz"/>
                            <FieldDescription>Leave blank to auto-generate a name.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Topics</FieldLabel>
                            <Combobox required onOpenChange={(x)=> setFocusTopicCombobox(x)} inputValue={focusTopicCombobox ? topicComboboxInputValue : (selectedTopics.length == Object.keys(noteCtx.topicWeights).length ? "All" : selectedTopics.length == 0 ? "None" : `${selectedTopics.length} selected`)} onInputValueChange={setTopicComboboxInputValue} value={selectedTopics} onValueChange={setSelectedTopics} multiple autoHighlight defaultValue={Object.keys(noteCtx.topicWeights)} items={Object.keys(noteCtx.topicWeights)}>
                                <ComboboxInput aria-invalid={selectedTopics.length === 0} placeholder={(selectedTopics.length == Object.keys(noteCtx.topicWeights).length ? "All" : selectedTopics.length == 0 ? "None" : `${selectedTopics.length} selected`)} />
                                <ComboboxContent>
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
                    </FieldGroup>
                    <FieldSeparator/>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend variant="label">Difficulty</FieldLegend>
                            <FieldDescription>Overall difficulty of quiz questions.</FieldDescription>
                            <RadioGroup value={difficulty} onValueChange={setDifficulty} required>
                                <FieldLabel htmlFor="difficulty-easier">
                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Easier</FieldTitle>
                                            <FieldDescription>Basic questions with more MCQs.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="easier" id="difficulty-easier"/>
                                    </Field>
                                </FieldLabel>
                                <FieldLabel htmlFor="difficulty-normal">
                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Normal</FieldTitle>
                                            <FieldDescription>Balance of basic and hard questions.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="normal" id="difficulty-normal"/>
                                    </Field>
                                </FieldLabel>
                                <FieldLabel htmlFor="difficulty-harder">
                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Harder</FieldTitle>
                                            <FieldDescription>Challenging questions with more text answers.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="harder" id="difficulty-harder"/>
                                    </Field>
                                </FieldLabel>
                            </RadioGroup>
                        </FieldSet>
                        <Field>
                            <FieldLabel>Question types</FieldLabel>
                            <Combobox multiple autoHighlight value={selectedQuestionTypes} onValueChange={(x)=> setSelectedQuestionTypes(x)} required items={quizQuestionTypes} itemToStringValue={(type: (typeof quizQuestionTypes)[number])=> type.name}>
                                <ComboboxChips ref={anchor} aria-invalid={selectedQuestionTypes.length === 0} className={`w-full ${selectedQuestionTypes.length === 0 ? 'border-destructive [data-state=open]:border-destructive' : ''}`}>
                                    <ComboboxValue>
                                    {(values) => (
                                        <Fragment>
                                        {values.map((value: (typeof quizQuestionTypes)[number]) => (
                                            <ComboboxChip key={value.value}>{value.name}</ComboboxChip>
                                        ))}
                                        <ComboboxChipsInput />
                                        </Fragment>
                                    )}
                                    </ComboboxValue>
                                </ComboboxChips>
                                <ComboboxContent className={"w-sm"}>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(item: (typeof quizQuestionTypes)[number]) => (
                                            <ComboboxItem key={item.value} value={item}>
                                                <Item size={'xs'} className="p-1">
                                                    <ItemContent>
                                                        <ItemTitle className="whitespace-nowrap">
                                                            {item.name}
                                                        </ItemTitle>
                                                        <ItemDescription>
                                                            {item.description}
                                                        </ItemDescription>
                                                    </ItemContent>
                                                </Item>
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            {selectedQuestionTypes.length === 0 ? <FieldError>At least 1 question type has to be selected.</FieldError> : <FieldDescription>Topics used for formulating quiz questions.</FieldDescription>}
                        </Field>
                        <FieldSet>
                            <FieldLegend variant="label">Length</FieldLegend>
                            <FieldDescription>Number of questions in the quiz.</FieldDescription>
                            <RadioGroup value={length} onValueChange={setLength} required>
                                <FieldLabel htmlFor="length-short">
                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Short</FieldTitle>
                                            <FieldDescription>7 questions - good for quick reviews.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="short" id="length-short"/>
                                    </Field>
                                </FieldLabel>
                                <FieldLabel htmlFor="length-medium">
                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Medium</FieldTitle>
                                            <FieldDescription>12 questions - a standard quiz length.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="medium" id="length-medium"/>
                                    </Field>
                                </FieldLabel>
                                <FieldLabel htmlFor="length-long">
                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Long</FieldTitle>
                                            <FieldDescription>20 questions - for in-depth assessments.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="long" id="length-long"/>
                                    </Field>
                                </FieldLabel>
                            </RadioGroup>
                        </FieldSet>
                        
                    </FieldGroup>
                    <FieldSeparator/>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Custom Instructions</FieldLabel>
                            <Textarea value={instructions} onChange={(e)=> setInstructions(e.target.value)} className="h-[150px] resize-none" placeholder="E.g. 'Focus on dates and events' or 'Give me more explain questions'"/>
                            <FieldDescription>Optional instructions to guide quiz question generation.</FieldDescription>
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </div>
            <Button type="submit" disabled={creating} variant={"raised"} className="mx-4 mb-0" size={"lg"}>Create quiz {creating ? <Spinner/> : <ArrowRight/>}</Button>
        </form>
    </Card>
}