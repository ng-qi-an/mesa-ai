'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import renameQuiz from "@/lib/actions/quiz/renameQuiz";
import { Pen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RenameQuizDialog({ open, setOpen, quizId, initialName, onSubmit }: { open: boolean, setOpen: (open: boolean) => void, quizId: string, initialName: string, onSubmit: (newName: string) => void }) {
    const [renaming, setRenaming] = useState(false);
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <form onSubmit={async(e)=>{
                e.preventDefault();
                const name = new FormData(e.currentTarget).get("name") as string;
                if (!name) {
                    return toast.warning("Please enter a new name.");
                }
                setRenaming(true);
                try {
                    await renameQuiz(quizId, name);
                    onSubmit(name);
                } catch (error) {
                    console.log("Error renaming quiz:", error);
                    toast.error("Failed to rename quiz. Please try again.")
                } finally {
                    setOpen(false);
                    setRenaming(false);
                }
            }} className="space-y-6">
                <DialogHeader>
                    <DialogTitle>Rename Quiz</DialogTitle>
                    <DialogDescription>Change the name of this quiz.</DialogDescription>
                </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Name</Label>
                            <Input id="name-1" required defaultValue={initialName} name="name" placeholder="New Quiz Name" />
                        </Field>
                    </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                        <Button type="submit" disabled={renaming}>{renaming ? <Spinner/> : <><Pen/> Rename Quiz</>}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}