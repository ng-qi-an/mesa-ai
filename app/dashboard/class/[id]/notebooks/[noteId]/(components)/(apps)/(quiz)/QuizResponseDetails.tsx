import { QuizResponseSelect } from "@/lib/schemas/schema";
import getNumberOfCorrectAnswers from "./(actions)/GetNumberOfCorrectAnswers";
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { Star } from "lucide-react";
import MCQList from "./questionTypes/MCQList";
import { Separator } from "@/components/ui/separator";
import LongAnswer from "./questionTypes/LongAnswer";
import ShortAnswer from "./questionTypes/ShortAnswer";
import TrueFalseList from "./questionTypes/TrueFalseList";

export default function QuizResponseDetails({response}:{response: QuizResponseSelect}){
    const correctPercentage = getNumberOfCorrectAnswers(response) / response.respondedQuestions.length;
    return <div className="h-full overflow-auto">
        <div className="h-[500px] px-4 shrink-0 flex flex-col items-center justify-center">
            <Star className="size-12 shrink-0 mt-8" fill="var(--foreground)"/>
            <h1 className="text-2xl font-medium mb-1 mt-2">{correctPercentage == 1 ? "PERFECT!" : correctPercentage > 0.7 ? "Great job!" : correctPercentage > 0.5 ? "Good effort" : "Woah..."}</h1>
            <p className="text-muted-foreground mb-8">{correctPercentage == 1 ? "Now who's the smart one 🎓" : correctPercentage > 0.7 ? "You're doing great! Keep it up! 🚀" : correctPercentage > 0.5 ? "Good effort! You're making progress! 💪" : "Keep trying! You can do better 😥"}</p>
            <div className="flex items-center gap-8 border bg-secondary/10 rounded-md px-6 py-4">
                <div className="w-[200px]">
                    <CircularProgressbarWithChildren value={getNumberOfCorrectAnswers(response)} maxValue={response.respondedQuestions.length} styles={{
                        path: {
                            stroke: 'var(--primary)',
                            strokeLinecap: 'round',
                            
                        },
                        trail: {
                            stroke: 'var(--border)',
                        }
                    }}>
                        <div className="text-lg font-medium">{getNumberOfCorrectAnswers(response)}/{response.respondedQuestions.length}</div>
                    </CircularProgressbarWithChildren>
                </div>
                <div className="flex flex-col ml-4 w-full gap-2">
                    <div className="flex justify-between w-full">
                        <span className="">Correct:</span>
                        <span className="text-green-400 font-medium">{getNumberOfCorrectAnswers(response)}</span>
                    </div>
                    <div className="flex justify-between w-full">
                        <span className="">Wrong:</span>
                        <span className="text-destructive font-medium">{response.respondedQuestions.length - getNumberOfCorrectAnswers(response) - response.respondedQuestions.filter((q) => !q.response).length}</span>
                    </div>
                    <div className="flex justify-between w-full">
                        <span className="">Skipped:</span>
                        <span className="font-medium">{response.respondedQuestions.filter((q) => !q.response).length}</span>
                    </div>
                </div>
            </div>
        </div>
        <Separator className="my-8"/>
        <div className="flex flex-col">
            {response.respondedQuestions.map((question, i) => <div key={i}>
                <p className="text-sm text-foreground/95 mb-4 px-6 text-justify font-medium">Q{i + 1}. {question.question}</p>
                {question.type == "multiple-choice" ?
                    <MCQList question={question} key={i} response={question.response} setResponse={()=>{}} revealAnswer={true} />
                : question.type == "true-false" ?
                    <TrueFalseList question={question} key={i} response={question.response} setResponse={()=>{}} revealAnswer={true} />
                : question.type == "short-answer" ?
                    <ShortAnswer question={question} key={i} response={question.response} setResponse={()=>{}} onSubmit={()=>{}} revealAnswer={true} answerReasoning={question.answerReasoning} />
                : question.type == "long-answer" ?
                    <LongAnswer question={question} key={i} response={question.response} setResponse={()=>{}} onSubmit={()=>{}} revealAnswer={true} answerReasoning={question.answerReasoning} />
                : null}
                <Separator className="my-8"/>
            </div>)}
        </div>
    </div>
}