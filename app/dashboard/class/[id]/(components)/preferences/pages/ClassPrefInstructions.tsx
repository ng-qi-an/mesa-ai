import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field"
import IconPicker from "@/components/ui/icon-picker"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { ClassSelect, TopicSelect } from "@/lib/schemas/schema"
import { availableSubjects, subjectsList } from "@/lib/subjects/subjectsList"
import { User } from "better-auth"
import { Circle, LaptopMinimal, LogOut, Moon, Trash } from "lucide-react"
import { Sun } from "lucide-react"
import { DynamicIcon } from "lucide-react/dynamic"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useState } from "react"

export default function ClassPrefInstructions({_class, pageConfiguredChanges, setPageConfiguredChanges}:{_class: ClassSelect & {topics: TopicSelect[]}, pageConfiguredChanges: any, setPageConfiguredChanges: (changes: any) => void}){
    useEffect(()=>{
        if (Object.keys(pageConfiguredChanges).length == 0){
            
        }
    }, [pageConfiguredChanges])
    const instructions = availableSubjects[_class.subject as keyof typeof availableSubjects].instructions;

    return <>
        <FieldSet className="w-full">
            <FieldGroup className="w-full gap-4">
                <Field className="gap-2">
                    <FieldLabel htmlFor="instructions">Chat Instructions</FieldLabel>
                    <FieldDescription>These instructions modify the behavior of chat responses.</FieldDescription>
                    <Textarea value={instructions.chat} disabled autoComplete="off" placeholder="Default instructions for the class's subject" className="resize-none h-32" />
                </Field>
                <Field className="gap-2">
                    <FieldLabel htmlFor="instructions">Notebook Instructions</FieldLabel>
                    <FieldDescription>These instructions modify how notebooks are generated.</FieldDescription>
                    <Textarea value={instructions.notebook} disabled autoComplete="off" placeholder="Default instructions for the class's subject" className="resize-none h-32" />
                </Field>
                <Field className="gap-2">
                    <FieldLabel htmlFor="instructions">Quiz Instructions</FieldLabel>
                    <FieldDescription>These instructions modify how quizzes are made.</FieldDescription>
                    <Textarea value={instructions.quiz} disabled autoComplete="off" placeholder="Default instructions for the class's subject" className="resize-none h-32" />
                </Field>
            </FieldGroup>
        </FieldSet>
        <div className="flex-1"/>
    </>
}