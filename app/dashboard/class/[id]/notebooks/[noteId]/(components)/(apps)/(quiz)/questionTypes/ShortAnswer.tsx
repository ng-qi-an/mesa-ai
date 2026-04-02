import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { QuizSelect } from "@/lib/schemas/schema";
import { Check, X } from "lucide-react";

export default function ShortAnswer({question, response, setResponse, revealAnswer, onSubmit}:{question: QuizSelect["questions"][number], response: string, setResponse: (response: string) => void, revealAnswer: boolean, onSubmit: (response: string) => void}) {
    return <form onSubmit={(e)=>{
        e.preventDefault();
        if (!revealAnswer) {
            onSubmit(response);
        }
    }} className="flex flex-col gap-3 mt-8 px-4">
        <Field>
            <FieldLabel>Short answer:</FieldLabel>
            <Input value={response} onChange={(e) => setResponse(e.target.value)} disabled={revealAnswer} placeholder="Type your response here..." />
            <FieldDescription>Answer using words, phrases or one sentence.</FieldDescription>
        </Field>
    </form>
}