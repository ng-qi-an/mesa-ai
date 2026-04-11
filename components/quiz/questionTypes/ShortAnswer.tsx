import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { QuizSelect } from "@/lib/schemas/schema";
import AnswerReasoning from "./AnswerReasoning";
import Hint from "./Hint";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Lightbulb } from "lucide-react";
import { QuizTextAnswerExplanationType } from "@/lib/actions/quiz/quizSchema";

export default function ShortAnswer({question, response, setResponse, revealAnswer, onSubmit, answerReasoning}:{question: QuizSelect["questions"][number], response: string, setResponse: (response: string) => void, revealAnswer: boolean, onSubmit: (response: string) => void, answerReasoning?: QuizTextAnswerExplanationType}) {
    return <form onSubmit={(e)=>{
        e.preventDefault();
        if (!revealAnswer) {
            onSubmit(response);
        }
    }} className="flex flex-col gap-3 px-4">
        <Field>
            <FieldLabel>Short answer:</FieldLabel>
            <InputGroup>
                <InputGroupInput value={response} onChange={(e) => setResponse(e.target.value)} disabled={revealAnswer} placeholder="Type your response here..." />
                <Hint hint={question.hint} align="end">
                    <InputGroupButton
                        aria-label="Hint"
                        title="Hint"
                        size="xs"
                        className="mr-1"
                    >
                        Hint <Lightbulb/>
                    </InputGroupButton>
                </Hint>
            </InputGroup>
            <FieldDescription>Answer using words, phrases or one sentence.</FieldDescription>
        </Field>
        {revealAnswer && <AnswerReasoning answerReasoning={answerReasoning!} suggestedAnswer={question.textualAnswer!} />}
    </form>
}