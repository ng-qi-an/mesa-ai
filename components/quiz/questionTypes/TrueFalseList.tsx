import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { QuizSelect } from "@/lib/schemas/schema";
import { Check, Lightbulb, X } from "lucide-react";
import Hint from "./Hint";
import { Button } from "@/components/ui/button";

export default function TrueFalseList({question, response, setResponse, revealAnswer, onSelectAnswer}:{question: QuizSelect["questions"][number], response: string, setResponse: (response: string) => void, revealAnswer: boolean, onSelectAnswer?: (answer: string) => void}) {
    return <div className="flex flex-col gap-3 px-4">
        {[true, false].map((option, index) => {
            return <Item key={index} variant={revealAnswer ? "outline" : "muted"} className={`${revealAnswer ? (question.trueFalseAnswer == option ? "border-green-500" : response == option.toString() ? "border-destructive" : "opacity-50 cursor-default") : "cursor-pointer hover:bg-secondary active:translate-y-0.5 active:scale-[0.99] transition-transform"}`} onClick={()=> {
                if (revealAnswer) return;
                setResponse(option.toString());
                if (onSelectAnswer) {
                    onSelectAnswer(option.toString());
                }
            }}>
                <ItemMedia variant="icon">
                    {revealAnswer && question.trueFalseAnswer == option ? 
                        <Check className="text-green-500"/> 
                    : revealAnswer && response == option.toString() ?
                    <X className="text-red-500"/>
                    :
                        <p className="font-medium text-muted-foreground">{String.fromCharCode(65 + index)}.</p>
                    }
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{option ? "True" : "False"}</ItemTitle>
                </ItemContent>
            </Item>
        })}
        <Hint hint={question.hint}><Button variant="outline" size="icon-sm" ><Lightbulb/></Button></Hint>
    </div>
}