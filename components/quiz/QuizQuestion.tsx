'use client';

import { QuizSelect } from "@/lib/schemas/schema";
import { Badge } from "@/components/ui/badge";
import MCQList from "./questionTypes/MCQList";
import TrueFalseList from "./questionTypes/TrueFalseList";
import ShortAnswer from "./questionTypes/ShortAnswer";
import { QuizTextAnswerExplanationType } from "@/lib/actions/quiz/quizSchema";
import LongAnswer from "./questionTypes/LongAnswer";

export default function QuizQuestion({quiz, question, response, setResponse, revealAnswer, answerReasoning, onSubmit}:{quiz: QuizSelect, question: QuizSelect["questions"][number], response: string, setResponse: (response: string)=> void, revealAnswer: boolean, answerReasoning?: QuizTextAnswerExplanationType, onSubmit: (isOptions: boolean, questionResponse: string) => void}) {
    return <div className="mb-2 h-full flex flex-col overflow-auto">
        <div className="mt-4 flex justify-between px-7 pl-4">
            {/* <Badge variant={"secondary"}>{quizQuestionTypes.find((t) => t.value === activeQuestion.type)!.name}</Badge> */}
            <Badge variant={"secondary"} className="capitalize">{question.difficulty}</Badge>
            <span className="text-muted-foreground text-xs">{quiz.questions.indexOf(question) + 1} / {quiz.questions.length}</span>
        </div>
        <p className="text-base text-foreground/95 mt-3 px-6 mb-8 text-justify">{question.question}</p>
        {question.type == "multiple-choice" ? 
            <MCQList question={question} response={response} setResponse={setResponse} revealAnswer={revealAnswer} onSelectAnswer={(answer)=> onSubmit(true, answer)} /> 
        : question.type == "true-false" ? 
            <TrueFalseList question={question} response={response} setResponse={setResponse} revealAnswer={revealAnswer} onSelectAnswer={(answer)=> onSubmit(true, answer)} /> 
        :question.type == "short-answer" ?
            <ShortAnswer question={question} response={response} setResponse={setResponse} revealAnswer={revealAnswer} onSubmit={(answer)=> onSubmit(false, answer)} answerReasoning={answerReasoning} />
        : question.type == "long-answer" ?
            <LongAnswer question={question} response={response} setResponse={setResponse} revealAnswer={revealAnswer} onSubmit={(answer)=> onSubmit(false, answer)} answerReasoning={answerReasoning} />
        :  null
        }
    </div>
}