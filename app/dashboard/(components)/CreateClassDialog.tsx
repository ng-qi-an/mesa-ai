'use client';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Circle, DraftingCompass, Globe, Presentation, Scroll } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { cn } from "@/lib/utils";
import IconPicker from "../../../components/ui/icon-picker";
import { DynamicIcon } from "lucide-react/dynamic";
import createClassServer from "@/lib/actions/classes/createClass";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { subjectsList } from "@/lib/subjectsList";


export default function CreateClassDialog({showCreate, setShowCreate}: {showCreate: boolean, setShowCreate: (show: boolean) => void}) {
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('');
    const [subject, setSubject] = useState('');
    const [icon, setIcon] = useState('presentation');
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const router = useRouter();
    return <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className={cn(theme, "h-max max-h-[90vh] sm:max-w-[500px] overflow-auto gap-4 p-0")}>
            <form onSubmit={async(e)=>{
                e.preventDefault();
                setCreating(true);
                if (!name || !theme || !subject || !icon) {
                    toast.warning("Please fill in all fields.")
                    setCreating(false);
                    return;
                }
                try {
                    const response = await createClassServer(name, subject, theme, icon)
                    console.log(response)
                    router.push(`/dashboard/class/${response[0].id}`)
                } catch (error) {
                    toast.error("Failed to create class. Please try again.")
                    console.error("Class creation error:", error)
                } finally {
                    setCreating(false);
                }
            }} className="dark:bg-primary/5 p-6 gap-4 grid transition-colors">
                <DialogHeader className="h-max mb-4">
                    <DialogTitle>Add class</DialogTitle>
                    <DialogDescription>Add a new class to your dashboard.</DialogDescription>
                </DialogHeader>
                <FieldSet className="w-full">
                    <FieldGroup className="w-full gap-4">
                        <div className="flex items-center gap-4 mb-2">
                            <Tooltip defaultOpen>
                                <TooltipTrigger asChild>
                                    <span>
                                    <IconPicker selected={icon} onSelect={(name) => {
                                        console.log(name)
                                        setIcon(name)
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
                                <Input required autoFocus id="name" autoComplete="off" className="dark:placeholder:text-white/50" placeholder="Geography" value={name} onChange={(e) => setName(e.target.value)} />
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="username">Subject</FieldLabel>
                            <Select required value={subject} onValueChange={(v) => {
                                setSubject(v)
                                setIcon(subjectsList.find(s => s.name === v)?.iconName || 'presentation')
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {subjectsList.map((subject) => {
                                        return (
                                            <SelectItem key={subject.name} value={subject.name}>
                                                <subject.icon className="size-4 mr-2 inline-block" />
                                                {subject.name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <FieldDescription className="dark:text-white/70">Mesa AI will generate {subject} prompts. Cannot be changed later.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="username">Theme</FieldLabel>
                            <Select required value={theme} onValueChange={setTheme}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a theme"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default"><Circle className="default fill-primary"/> Default</SelectItem>
                                    <SelectItem value="red"><Circle className="red fill-primary"/> Red</SelectItem>
                                    <SelectItem value="orange"><Circle className="orange fill-primary"/> Orange</SelectItem>
                                    <SelectItem value="green"><Circle className="green fill-primary"/> Green</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldDescription className="dark:text-white/70">Color theme used across your class.</FieldDescription>
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <DialogFooter>
                    <Button disabled={creating} variant="secondary" type="button" className="bg-white/10 hover:bg-white/20" onClick={() => {
                        setShowCreate(false)
                        setName('')
                        setTheme('')
                        setSubject('')
                    }}>Cancel</Button>
                    <Button disabled={creating}>Create {creating && <Spinner/>} </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}