import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import IconPicker from "@/components/ui/icon-picker"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ClassSelect, TopicSelect } from "@/lib/schemas/schema"
import { availableSubjects, subjectsList } from "@/lib/subjects/subjectsList"
import { Circle } from "lucide-react"
import { DynamicIcon } from "lucide-react/dynamic"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useState } from "react"

export default function ClassPrefGeneral({_class, pageConfiguredChanges, setPageConfiguredChanges}:{_class: ClassSelect & {topics: TopicSelect[]}, pageConfiguredChanges: any, setPageConfiguredChanges: (changes: any) => void}){
    const router = useRouter();
    const [name, setName] = useState(pageConfiguredChanges.name || _class.name);
    const [theme, setTheme] = useState(pageConfiguredChanges.theme || _class.theme);
    const [subject, setSubject] = useState((pageConfiguredChanges.subject || _class.subject) as keyof typeof availableSubjects);
    const [icon, setIcon] = useState(pageConfiguredChanges.icon || _class.icon);
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    useEffect(()=>{
        if (Object.keys(pageConfiguredChanges).length == 0){
            setName(_class.name);
            setTheme(_class.theme);
            setSubject(_class.subject as keyof typeof availableSubjects);
            setIcon(_class.icon);
        }
    }, [pageConfiguredChanges])

    return <>
        <FieldSet className="w-full">
            <FieldGroup className="w-full gap-4">
                <div className={`flex items-center gap-4 mb-2 ${theme}`}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <IconPicker selected={icon} onSelect={(name) => {
                                    setIcon(name)
                                    setPageConfiguredChanges({ ...pageConfiguredChanges, icon: name });
                                    setIconPickerOpen(false)
                                }} open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                                    <Button size={"icon-lg"} className={`transition-colors size-22 rounded-lg bg-primary  hover:bg-primary/80`}>
                                        <DynamicIcon name={icon as any} className={`text-primary-foreground size-8`} strokeWidth={2}/>
                                    </Button>
                                </IconPicker>
                            </span> 
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start">
                            Click to change class icon
                        </TooltipContent>
                    </Tooltip>
                    <Field className="gap-2">
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input required autoFocus id="name" autoComplete="off" className="dark:placeholder:text-white/50" placeholder="Geography" value={name} onChange={(e) => {
                            setName(e.target.value);
                            setPageConfiguredChanges({ ...pageConfiguredChanges, name: e.target.value });
                        }} />
                    </Field>
                </div>
                <Field>
                    <FieldLabel htmlFor="username">Subject</FieldLabel>
                    <Select required value={subject} onValueChange={(v: keyof typeof availableSubjects) => {
                        const oldSubject = subject;
                        setPageConfiguredChanges({ ...pageConfiguredChanges, subject: v });
                        setSubject(v)
                        if (icon == "presentation" || icon == availableSubjects[oldSubject]?.iconName){
                            setPageConfiguredChanges({ ...pageConfiguredChanges, icon: availableSubjects[v].iconName });
                            setIcon(availableSubjects[v].iconName)
                        }
                        if (!name.trim() || name == availableSubjects[oldSubject]?.name){
                            setPageConfiguredChanges({ ...pageConfiguredChanges, name: availableSubjects[v].name });
                            setName(availableSubjects[v].name)
                        }
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a subject"/>
                        </SelectTrigger>
                        <SelectContent>
                            {subjectsList.map((subject) => {
                                return (
                                    <SelectItem key={subject.name} value={subject.name.toLowerCase()}>
                                        <subject.icon className="size-4 mr-2 inline-block" />
                                        {subject.name}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <FieldDescription className="dark:text-white/70">Content will be generate based on <b>{subject}</b> instructions.</FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="username">Theme</FieldLabel>
                    <Select required value={theme} onValueChange={(v) => {
                        setTheme(v);
                        setPageConfiguredChanges({ ...pageConfiguredChanges, theme: v });
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a theme"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default"><Circle className="default fill-primary"/> Default</SelectItem>
                            <SelectItem value="red"><Circle className="red fill-primary"/> Red</SelectItem>
                            <SelectItem value="orange"><Circle className="orange fill-primary"/> Orange</SelectItem>
                            <SelectItem value="green"><Circle className="green fill-primary"/> Green</SelectItem>
                            <SelectItem value="teal"><Circle className="teal fill-primary"/> Teal</SelectItem>
                            <SelectItem value="blue"><Circle className="blue fill-primary"/> Blue</SelectItem>
                            <SelectItem value="indigo"><Circle className="indigo fill-primary"/> Indigo</SelectItem>
                            <SelectItem value="purple"><Circle className="purple fill-primary"/> Purple</SelectItem>
                            <SelectItem value="pink"><Circle className="pink fill-primary"/> Pink</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldDescription className="dark:text-white/70">Color theme used across this class.</FieldDescription>
                </Field>
            </FieldGroup>
        </FieldSet>
        <div className="flex-1"/>
    </>
}