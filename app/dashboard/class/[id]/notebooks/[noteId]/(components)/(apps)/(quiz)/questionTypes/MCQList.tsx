import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { QuizSelect } from "@/lib/schemas/schema";
import { Check, Lightbulb, X } from "lucide-react";
import Hint from "./Hint";
import { Button } from "@/components/ui/button";

export default function MCQList({question, response, setResponse, revealAnswer, onSelectAnswer}:{question: QuizSelect["questions"][number], response: string, setResponse: (response: string) => void, revealAnswer: boolean, onSelectAnswer?: (answer: string) => void}) {
    return <div className="flex flex-col gap-3 mt-8 px-4">
        {question.options!.map((option, index) => {
            return <Item key={index} variant={revealAnswer ? "outline" : "muted"} className={`${revealAnswer ? option.answer ? "border-green-500" : option.value == response ? "border-destructive" : "opacity-50 cursor-default" : "cursor-pointer hover:bg-secondary active:translate-y-0.5 active:scale-[0.99] transition-transform"}`} onClick={()=> {
                if (revealAnswer) return;
                setResponse(option.value);
                if (onSelectAnswer) {
                    onSelectAnswer(option.value);
                }
            }}>
                <ItemMedia variant="icon">
                    {revealAnswer ? (option.answer ? <Check className="text-green-500"/> : option.value == response ? <X className="text-red-500"/> : <p className="font-medium text-muted-foreground">{String.fromCharCode(65 + index)}.</p>)
                    : <p className="font-medium text-muted-foreground">{String.fromCharCode(65 + index)}.</p>
                    }
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{option.value}</ItemTitle>
                    {revealAnswer && (
                        <ItemDescription className="line-clamp-none">
                            {option.explanation}
                        </ItemDescription>
                    )}
                </ItemContent>
            </Item>
        })}
        <Hint hint={question.hint}><Button variant="outline" size="icon-sm" ><Lightbulb/></Button></Hint>
    </div>
}