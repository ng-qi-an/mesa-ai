'use client';

import { QuizResponseSelect, QuizSelect } from "@/lib/schemas/schema";
import QuizActionsDropdown from "./QuizActionsDropdown";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { quizQuestionTypes } from "@/lib/utils/quizQuestionTypes";
import MCQList from "./questionTypes/MCQList";
import TrueFalseList from "./questionTypes/TrueFalseList";
import ShortAnswer from "./questionTypes/ShortAnswer";
import { QuizTextAnswerExplanationType } from "@/app/api/notebook/schema";
import markTextAnswer from "./(actions)/markTextAnswer";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import QuizQuestion from "./QuizQuestion";
import { Empty, EmptyContent, EmptyHeader } from "@/components/ui/empty";
import saveResponseAttempt from "./(actions)/saveResponseAttempt";

export default function QuizNewResponsePanel({quiz, setQuiz, response, responses, setResponses, setSelectedQuizId, setSelectedResponseId, setIsAttempting}: {quiz: QuizSelect, setQuiz: (quiz: QuizSelect) => void, response: QuizResponseSelect, responses: QuizResponseSelect[], setResponses: (responses: QuizResponseSelect[]) => void, setSelectedQuizId: (id: string) => void, setSelectedResponseId: (id: string) => void, setIsAttempting: (attempting: boolean) => void}) {
    const [activeQuestionId, setActiveQuestionId] = useState(response.attemptingQuestionId || quiz.questions[0].id);
    const activeQuestion = quiz.questions.find(q => q.id === activeQuestionId);
    const activeIndex = quiz.questions.findIndex(q => q.id === activeQuestionId);
    const activeRespondedQuestion = response.respondedQuestions.find(rq => rq.id === activeQuestionId);
    const [questionResponse, setQuestionResponse] = useState<string>("");
    const [marking, setMarking] = useState(false);
    const [answerReasoning, setAnswerReasoning] = useState<QuizTextAnswerExplanationType | null>(null);
    const [revealAnswer, setRevealAnswer] = useState(false);

    useEffect(()=>{
        (async()=>{
            if (activeRespondedQuestion) {
                console.log("Found existing response for active question, loading response and answer reasoning if applicable", activeRespondedQuestion);
                setQuestionResponse(activeRespondedQuestion.response);
                setRevealAnswer(true);
                if (activeRespondedQuestion.answerReasoning) {
                    setAnswerReasoning(activeRespondedQuestion.answerReasoning);
                }
            } else {
                setQuestionResponse("");
                setRevealAnswer(false);
                setAnswerReasoning(null);
            }
            await saveResponseAttempt(response.id, {attemptingQuestionId: activeQuestionId}, responses);
        })();
    }, [activeQuestionId])
    function compileFinalQuestions(questionResponse: string, answerReasoning?: QuizTextAnswerExplanationType) {
        const respondedQuestions = [...response.respondedQuestions]
        if (respondedQuestions.find(rq => rq.id === activeQuestionId)) {
            const index = respondedQuestions.findIndex(rq => rq.id === activeQuestionId);
            respondedQuestions[index] = {...activeQuestion!, response: questionResponse, answerReasoning: answerReasoning};
        } else {
            respondedQuestions.push({...activeQuestion!, response: questionResponse, answerReasoning: answerReasoning});
        }
        return respondedQuestions;
    }
    async function markAnswer(isOption: boolean, questionResponse: string){
        console.log("Marking answer...", {isOption, questionResponse, activeQuestion})
        if (!activeQuestion || !questionResponse) return;
        setMarking(true);
        if (isOption){
            setRevealAnswer(true);
            setResponses(await saveResponseAttempt(response.id, {respondedQuestions: compileFinalQuestions(questionResponse)}, responses));
        } else {
            try {
                const r = await markTextAnswer({response: questionResponse, questionTitle: activeQuestion!.question, correctAnswer: activeQuestion!.textualAnswer!, longText: activeQuestion.type == "long-answer", hint: activeQuestion!.hint})
                setAnswerReasoning(r);    
                setRevealAnswer(true);
                setResponses(await saveResponseAttempt(response.id, {respondedQuestions: compileFinalQuestions(questionResponse, r)}, responses ));
            } catch (e) {
                console.error("Error marking answer:", e);
                toast.error("There was an error marking your answer. Please try again.");
            }
        }
        setMarking(false);
    }
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
            {activeQuestion ? <QuizQuestion quiz={quiz} question={activeQuestion} response={questionResponse} setResponse={setQuestionResponse} revealAnswer={revealAnswer} answerReasoning={answerReasoning!} 
                onSubmit={markAnswer}/>
            : <Empty>
                <EmptyHeader>Question not found</EmptyHeader>
                <EmptyContent>The question you are looking for does not exist. Please try again.</EmptyContent>
            </Empty>}
            <div className="flex w-full gap-2 px-2 pb-1">
                <Button disabled={marking} variant={"secondaryRaised"} size={'lg'} onClick={()=>{
                    const prevQuestion = quiz.questions[activeIndex - 1];
                    if (prevQuestion) {    
                        setActiveQuestionId(prevQuestion.id)
                    } else {
                        setSelectedResponseId("");
                        setIsAttempting(false);
                    }
                }} className="flex-1">Back</Button>
                {!revealAnswer ?
                <Button disabled={!questionResponse || marking} variant={questionResponse ? 'raised' : "secondaryRaised"} size={'lg'} className="flex-1" onClick={()=> markAnswer(!activeQuestion?.textualAnswer, questionResponse)}>
                    {marking ? <Spinner/> : "Check"}
                </Button>
                : <Button variant={"raised"} size={'lg'} onClick={async ()=> {
                    const nextQuestion = quiz.questions[activeIndex + 1];
                    if (nextQuestion) {    
                        setActiveQuestionId(nextQuestion.id)
                        setResponses(await saveResponseAttempt(response.id, {attemptingQuestionId: nextQuestion.id}, responses));
                    } else {
                        setResponses(await saveResponseAttempt(response.id, {completedQuiz: true}, responses));
                        setSelectedResponseId(response.id);
                        setIsAttempting(false);
                    }
                }} className="flex-1">{quiz.questions[activeIndex + 1] ? "Continue" : "Finish"}</Button>}
            </div>
        </div>
    </Card>
}