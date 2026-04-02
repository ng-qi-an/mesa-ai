'use client';

import { QuizSelect } from "@/lib/schemas/schema";
import QuizActionsDropdown from "./QuizActionsDropdown";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { quizQuestionTypes } from "@/lib/utils/quizQuestionTypes";
import MCQList from "./questionTypes/MCQList";
import TrueFalseList from "./questionTypes/TrueFalseList";
import ShortAnswer from "./questionTypes/ShortAnswer";

export default function QuizQuestionsPanel({quiz: importedQuiz, setSelectedQuizId}: {quiz: QuizSelect, setSelectedQuizId: (id: string) => void}) {
    const [quiz, setQuiz] = useState(importedQuiz);
    const [activeQuestionId, setActiveQuestionId] = useState(quiz.questions[0].id);
    const activeQuestion = quiz.questions.find(q => q.id === activeQuestionId);
    const activeIndex = quiz.questions.findIndex(q => q.id === activeQuestionId);
    const [response, setResponse] = useState<string>("");
    const [revealAnswer, setRevealAnswer] = useState(false);
    return <Card size="sm" className={`rounded-md ring-neutral-200 dark:ring-neutral-900 h-full pb-2!`}>
        <CardHeader className="items-center group flex cursor-pointer relative">
            <div className="flex w-full items-center gap-1" onClick={()=> setSelectedQuizId("")}>
                <ChevronLeft onClick={()=> setSelectedQuizId("")} className="text-muted-foreground group-hover:text-foreground size-4"/>
                <CardTitle
                className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                    {quiz.name}
                </CardTitle>
            </div>
            <QuizActionsDropdown triggerClassName="inline-block w-fit absolute -top-1 right-4" quiz={quiz} onRename={(newName) => {
               setQuiz({...quiz, name: newName});
            }} onDelete={()=>{
                setSelectedQuizId("");
            }}/>
        </CardHeader>
        <div className="h-full w-full flex flex-col min-h-0">
            <Separator className="mb-2" />
            {activeQuestion ?
            <div className="mb-2 h-full flex flex-col overflow-auto">
                <div className="mt-4 flex justify-between px-7 pl-4">
                    {/* <Badge variant={"secondary"}>{quizQuestionTypes.find((t) => t.value === activeQuestion.type)!.name}</Badge> */}
                    <Badge variant={"secondary"} className="capitalize">{activeQuestion.difficulty}</Badge>
                    <span className="text-muted-foreground text-xs">{quiz.questions.indexOf(activeQuestion) + 1} / {quiz.questions.length}</span>
                </div>
                <p className="text-base text-foreground/95 mt-3 px-6 text-justify">{activeQuestion.question}</p>
                {activeQuestion.type == "multiple-choice" ? 
                    <MCQList question={activeQuestion} response={response} setResponse={setResponse} revealAnswer={revealAnswer} onSelectAnswer={(answer)=> setRevealAnswer(true)} /> 
                : activeQuestion.type == "true-false" ? 
                    <TrueFalseList question={activeQuestion} response={response} setResponse={setResponse} revealAnswer={revealAnswer} onSelectAnswer={(answer)=> setRevealAnswer(true)} /> 
                :activeQuestion.type == "short-answer" ?
                    <ShortAnswer question={activeQuestion} response={response} setResponse={setResponse} revealAnswer={revealAnswer} onSubmit={()=> setRevealAnswer(true)} />
                : null
                }
            </div>
            : null}
            <div className="flex w-full gap-2 px-2 pb-1">
                {activeIndex != 0 && <Button disabled={activeIndex === 0} variant={"secondaryRaised"} size={'lg'} onClick={()=>{
                    const prevQuestion = quiz.questions[activeIndex - 1];
                    if (prevQuestion) {    
                    setActiveQuestionId(prevQuestion.id)
                    }
                }} className="flex-1">Back</Button>}
                {!revealAnswer ?
                <Button disabled={!response} variant={response ? 'raised' : "secondaryRaised"} size={'lg'} className="flex-1" onClick={()=>{
                    setRevealAnswer(true);
                }}>
                    Check
                </Button>
                : <Button variant={"raised"} size={'lg'} onClick={()=> {
                    const nextQuestion = quiz.questions[activeIndex + 1];
                    if (nextQuestion) {    
                        setRevealAnswer(false);
                        setResponse("");
                        setActiveQuestionId(nextQuestion.id)
                    }
                }} className="flex-1">Continue</Button>}
            </div>
        </div>
    </Card>
}