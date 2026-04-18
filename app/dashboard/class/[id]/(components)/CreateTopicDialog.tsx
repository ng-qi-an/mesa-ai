'use client';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import IconPicker from "@/components/ui/icon-picker";
import { DynamicIcon } from "lucide-react/dynamic";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useClass } from "@/components/providers/class-provider";
import createTopicServer from "@/lib/actions/topics/createTopic";


export default function CreateTopicDialog({showCreate, setShowCreate}: {showCreate: boolean, setShowCreate: (show: boolean) => void}) {
    const [icon, setIcon] = useState('book-open');
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const router = useRouter();
    const { _class } = useClass();

    return <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className={cn(_class.theme, "h-max max-h-[90vh] sm:max-w-[500px] overflow-auto gap-4 p-0")}>
            <form onSubmit={async(e)=>{
                e.preventDefault();
                setCreating(true);
                const name = new FormData(e.currentTarget).get("name") as string;
                if (!name || !icon) {
                    toast.warning("Please fill in all fields.")
                    setCreating(false);
                    return;
                }
                try {
                    const response = await createTopicServer(name, icon, _class.id)
                    console.log(response)
                    router.push(`/dashboard/class/${_class.id}/topic/${response[0].id}`)
                } catch (error) {
                    if (error instanceof Error && error.message === "already_exists") {
                        toast.error("This topic already exists. Please choose a different name.")
                    } else {
                        toast.error("Failed to create topic. Please try again.")
                        console.log("Topic creation error:", error)
                    }
                } finally {
                    setCreating(false);
                }
            }} className="p-6 gap-4 grid">
                <DialogHeader className="h-max mb-4">
                    <DialogTitle>Add topic</DialogTitle>
                    <DialogDescription>Topics help to organise class content into distinct sections.</DialogDescription>
                </DialogHeader>
                <FieldSet className="w-full">
                    <FieldGroup className="w-full gap-4">
                        <div className="flex items-center gap-4 mb-2">
                            <Tooltip>
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
                                    Click to change topic icon
                                </TooltipContent>
                            </Tooltip>
                            <Field className="gap-2">
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input required autoFocus id="name" name="name" autoComplete="off" className="dark:placeholder:text-white/50" placeholder="Chapter 1"  />
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
                <DialogFooter>
                    <Button disabled={creating} variant="secondary" type="button" className="bg-white/10 hover:bg-white/20" onClick={() => {
                        setShowCreate(false)
                    }}>Cancel</Button>
                    <Button disabled={creating}>Create {creating && <Spinner/>} </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}