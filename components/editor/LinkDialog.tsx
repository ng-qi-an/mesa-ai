import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

export default function LinkDialog({open, setOpen, isForCreate, initialUrl, onUrlChange}:{open: boolean, setOpen: (open: boolean) => void, isForCreate: boolean, initialUrl?: string, onUrlChange: (url: string) => void}) {
    const [url, setUrl] = useState(initialUrl || "");
    useEffect(()=>{
        if (!open){
            setUrl(initialUrl || "");
        }
    }, [open])
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isForCreate? "Create" : "Edit"} Link</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e)=>{
                e.preventDefault();
                onUrlChange(url);
                setOpen(false);
            }}>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="name">URL</FieldLabel>
                        <Input id="name" autoComplete="off" required type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit">{isForCreate? "Create" : "Update"}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}