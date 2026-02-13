
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Circle, DraftingCompass, Globe, Presentation, Scroll } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import IconPicker from "./ui/icon-picker";


export default function CreateClassDialog({showCreate, setShowCreate}: {showCreate: boolean, setShowCreate: (show: boolean) => void}) {
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('');
    const [subject, setSubject] = useState('');
    const [icon, setIcon] = useState('presentation');
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    return <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className={cn(theme, "h-max max-h-[90vh] sm:max-w-[500px] overflow-auto gap-4 p-0")}>
            <div className="dark:bg-primary/5 p-6 gap-4 grid transition-colors">
            <DialogHeader className="h-max mb-4">
                <DialogTitle>Add class</DialogTitle>
                <DialogDescription>Add a new class to your dashboard.</DialogDescription>
            </DialogHeader>
            <FieldSet className="w-full">
                <FieldGroup className="w-full gap-4">
                    <div className="flex items-center gap-4 mb-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <IconPicker selected={icon} onSelect={(name) => {
                                    console.log(name)
                                    setIcon(name)
                                    setIconPickerOpen(false)
                                }} open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                                    <Button size={"icon-lg"} className={`transition-colors size-22 rounded-lg bg-primary hover:bg-primary/80`}>
                                        <Presentation className={`${theme && "dark:text-white"} size-8`} strokeWidth={2}/>
                                    </Button>
                                </IconPicker>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                                Click to change class icon
                            </TooltipContent>
                        </Tooltip>
                        <Field className="gap-2">
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input  autoFocus id="name" autoComplete="off" className="dark:placeholder:text-white/50" placeholder="Geography" value={name} onChange={(e) => setName(e.target.value)} />
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="username">Subject</FieldLabel>
                        <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a subject"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="geography"><Globe/> Geography</SelectItem>
                                <SelectItem value="history"><Scroll/> History</SelectItem>
                                <SelectItem value="math"><DraftingCompass/> Math</SelectItem>
                            </SelectContent>
                        </Select>
                        <FieldDescription className="dark:text-white/70">Affects the types of documents and prompt instructions. Cannot be changed later.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="username">Theme</FieldLabel>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a theme"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="red"><Circle className="red fill-primary"/> Red</SelectItem>
                                <SelectItem value="green"><Circle className="green fill-primary"/> Green</SelectItem>
                                <SelectItem value="orange"><Circle className="orange fill-primary"/> Orange</SelectItem>
                            </SelectContent>
                        </Select>
                        <FieldDescription className="dark:text-white/70">Color theme used across your class.</FieldDescription>
                    </Field>
                </FieldGroup>
            </FieldSet>
            <DialogFooter>
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20" onClick={() => {
                    setShowCreate(false)
                    setName('')
                    setTheme('')
                    setSubject('')
                }}>Cancel</Button>
                <Button>Create</Button>
            </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
}