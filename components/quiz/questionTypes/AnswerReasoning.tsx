import { QuizTextAnswerExplanationType } from "@/lib/actions/quiz/quizSchema";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Check, X } from "lucide-react";
import { Streamdown } from "streamdown";
export default function AnswerReasoning({answerReasoning, suggestedAnswer}:{answerReasoning: QuizTextAnswerExplanationType, suggestedAnswer: string}){
    return answerReasoning ? <Item variant="outline" className={`${answerReasoning.isCorrect ? "border-green-500" : "border-red-500"} mt-4`}>
        <ItemMedia variant="icon">
            {answerReasoning.isCorrect ? <Check /> : <X />}
        </ItemMedia>
        <ItemContent>
            <ItemTitle>{answerReasoning.isCorrect ? "Spot on!" : "Not quite..."}</ItemTitle>
                <ItemDescription/>
                <Streamdown mode="static" className="streamdown text-muted-foreground text-sm/6">
                    {answerReasoning.explanation + "\n\n" + "**Suggested answer:**\n\n" + suggestedAnswer}
                </Streamdown>
        </ItemContent>
    </Item>
    : <p className="text-muted-foreground">No explanation available.</p>
}