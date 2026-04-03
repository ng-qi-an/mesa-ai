import { QuizTextAnswerExplanationType } from "@/app/api/notebook/schema";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { QuizSelect } from "@/lib/schemas/schema";
import AnswerReasoning from "./AnswerReasoning";
import Hint from "./Hint";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export default function LongAnswer({question, response, setResponse, revealAnswer, onSubmit, answerReasoning}:{question: QuizSelect["questions"][number], response: string, setResponse: (response: string) => void, revealAnswer: boolean, onSubmit: (response: string) => void, answerReasoning?: QuizTextAnswerExplanationType}) {
    return <form onSubmit={(e)=>{
        e.preventDefault();
        if (!revealAnswer) {
            onSubmit(response);
        }
    }} className="flex flex-col gap-3 mt-8 px-4 h-full">
        <Field className="h-full max-h-[200px]">
            <FieldLabel>Long answer</FieldLabel>
            <FieldDescription>Provide a detailed response to the question.</FieldDescription>
            <Textarea className="h-full resize-none" value={response} onChange={(e) => setResponse(e.target.value)} disabled={revealAnswer} placeholder="Type your response here..." />
        </Field>
        <Hint hint={question.hint}><Button variant="outline" size="icon-sm"><Lightbulb/></Button></Hint>
        {revealAnswer && <AnswerReasoning answerReasoning={answerReasoning!} suggestedAnswer={question.textualAnswer!} />}
    </form>
}