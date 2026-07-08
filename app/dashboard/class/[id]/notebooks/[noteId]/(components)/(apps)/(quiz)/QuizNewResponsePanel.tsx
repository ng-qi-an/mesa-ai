'use client';

import { QuizResponseSelect, QuizSelect } from "@/lib/schemas/schema";
import QuizActionsDropdown from "@/components/quiz/QuizActionsDropdown";
import { ArrowRight, Check, ChevronLeft, History, Maximize2, Minimize2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuizTextAnswerExplanationType } from "@/lib/actions/quiz/quizSchema";
import markTextAnswer from "@/lib/actions/quiz/markTextAnswer";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import { Empty, EmptyContent, EmptyHeader } from "@/components/ui/empty";
import saveResponseAttempt from "@/lib/actions/quiz/saveResponseAttempt";
import { useTabs } from "@/components/providers/tabs-provider";

export default function QuizNewResponsePanel({quiz, setQuiz, response, responses, setResponses, setSelectedResponseId, setIsAttempting}: {quiz: QuizSelect, setQuiz: (quiz: QuizSelect) => void, response: QuizResponseSelect, responses: QuizResponseSelect[], setResponses: (responses: QuizResponseSelect[]) => void, setSelectedResponseId: (id: string) => void, setIsAttempting: (attempting: boolean) => void}) {
    const [activeQuestionId, setActiveQuestionId] = useState(response.attemptingQuestionId || quiz.questions[0].id);
    const activeQuestion = quiz.questions.find(q => q.id === activeQuestionId);
    const activeIndex = quiz.questions.findIndex(q => q.id === activeQuestionId);
    const activeRespondedQuestion = response.respondedQuestions.find(rq => rq.id === activeQuestionId);
    const [questionResponse, setQuestionResponse] = useState<string>("");
    const [marking, setMarking] = useState(false);
    const [answerReasoning, setAnswerReasoning] = useState<QuizTextAnswerExplanationType | null>(null);
    const [revealAnswer, setRevealAnswer] = useState(false);
    const { moveTab, closeTab, getTabGroup } = useTabs();
    const activeTabGroup = quiz ? getTabGroup(quiz.id) : undefined;

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
        if (!activeQuestion) return;
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
    return <div className={`bg-card h-full flex flex-col pb-3`}>
        <div className="flex items-center h-12 shrink-0 px-3 items-center border-b">
            <div className="flex w-full items-center gap-2">
                <Button disabled={responses.length < 2} onClick={()=> setIsAttempting(false)} variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0">
                    <History className="size-4"/>
                </Button>
                <p className="text-sm w-full">
                    {quiz.name}
                </p>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0" onClick={()=>{
                    if (!quiz) return;
                    moveTab(quiz.id!, activeTabGroup === "side" ? "main" : "side")
                }}>
                    {activeTabGroup == "side" ? <Maximize2 className="size-4"/> : <Minimize2 className="size-4"/>}
                </Button>
            </div>
            <QuizActionsDropdown triggerClassName="" quiz={quiz} onRename={(newName) => {
                setQuiz({...quiz, name: newName});
            }} onDelete={()=>{
                closeTab(quiz.id);
            }}/>
        </div>

        <div className="h-full w-full flex flex-col min-h-0">
            <Separator className="mb-2" />
            {activeQuestion ? <QuizQuestion quiz={quiz} question={activeQuestion} response={questionResponse} setResponse={setQuestionResponse} revealAnswer={revealAnswer} answerReasoning={answerReasoning!} 
                onSubmit={markAnswer}/>
            : <Empty>
                <EmptyHeader>Question not found</EmptyHeader>
                <EmptyContent>The question you are looking for does not exist. Please try again.</EmptyContent>
            </Empty>}
            <div className="flex flex-col">
                {!revealAnswer ? 
                    <Button variant={"link"} className="mb-3 text-muted-foreground hover:text-foreground" onClick={()=>{
                        markAnswer(!activeQuestion?.textualAnswer, questionResponse);
                    }}>Skip this question <ArrowRight/></Button>
                : answerReasoning && !answerReasoning.isCorrect && 
                    <Button variant={"link"} className="mb-3 text-muted-foreground hover:text-foreground" onClick={async()=>{
                        const newReasoning = {isCorrect: true, explanation: `Manually marked by student as correct.`}
                        setAnswerReasoning(newReasoning);
                        setResponses(await saveResponseAttempt(response.id, {respondedQuestions: compileFinalQuestions(questionResponse, newReasoning)}, responses ));
                    }}>Mark my answer as correct <Check/></Button>
                }
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
                    <Button disabled={!questionResponse || marking} variant={questionResponse ? 'raised' : "secondaryRaised"} size={'lg'} className="flex-1" onClick={()=> {
                        if (!questionResponse) return;
                        markAnswer(!activeQuestion?.textualAnswer, questionResponse)
                    }}>
                        {marking ? <Spinner/> : "Check"}
                    </Button>
                    : <Button variant={"raised"} size={'lg'} onClick={async ()=> {
                        const nextQuestion = quiz.questions[activeIndex + 1];
                        if (nextQuestion) {    
                            setActiveQuestionId(nextQuestion.id)
                            setResponses(await saveResponseAttempt(response.id, {attemptingQuestionId: nextQuestion.id}, responses));
                        } else {
                            setMarking(true);
                            setResponses(await saveResponseAttempt(response.id, {completedQuiz: true}, responses));
                            setSelectedResponseId(response.id);
                            setIsAttempting(false);
                        }
                    }} className="flex-1">{quiz.questions[activeIndex + 1] ? "Continue" : "Finish"}</Button>}
                </div>
            </div>
        </div>
    </div>
}