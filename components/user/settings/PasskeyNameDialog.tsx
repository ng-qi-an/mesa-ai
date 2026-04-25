'use client';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSet } from "../../ui/field";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function PasskeyNameDialog({open, setOpen, onSave, initialName}: {open: boolean, setOpen: (open: boolean) => void, onSave: (name: string) => Promise<void>, initialName?: string}){
    const [loading, setLoading] = useState(false);

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{initialName ? "Edit passkey name" : "Add passkey"}</DialogTitle>
                <DialogDescription>Enter a new name for your passkey.</DialogDescription>
            </DialogHeader>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                setLoading(true);
                try {
                    await onSave(data.get("name") as string);
                    setOpen(false);
                } catch(error) {
                    toast.error(error instanceof Error ? error.message : "Unknown error");
                } finally {
                    setLoading(false);
                }
            }}>
                <FieldSet>
                    <FieldGroup className="gap-4">
                        <Field className="gap-2">
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input disabled={loading} id="name" name="name" type="text" className="w-full" defaultValue={initialName} required />
                        </Field>
                    </FieldGroup>
                </FieldSet>
            <DialogFooter className="mt-6">
                <Button variant={"ghost"} type="button" onClick={() => setOpen(false)} disabled={loading}>
                    Close
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Spinner/>}
                    Save
                </Button>
            </DialogFooter>
            
            </form>
        </DialogContent>
    </Dialog>
}