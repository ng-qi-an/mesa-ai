'use client';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "../../ui/field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import checkIfCredsExists from "./(actions)/checkIfCredsExists";
import setPassword from "./(actions)/setPassword";

export default function ResetPasswordDialog({children}: {children: React.ReactNode}){
    const [loading, setLoading] = useState(true);
    const [hasCredentials, setHasCredentials] = useState(true);
    const [open, setOpen] = useState(false);
    useEffect(()=>{
        (async()=>{
            if (!(await checkIfCredsExists())){
                setHasCredentials(false);
            } else {
                setHasCredentials(true);
            }
            setLoading(false);
        })();
    }, [])
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>  
            {children}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>Enter your current password and a new password to reset your password.</DialogDescription>
            </DialogHeader>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const currentPassword = data.get("currentPassword") as string;
                const newPassword = data.get("newPassword") as string;
                const confirmPassword = data.get("confirmPassword") as string;
                if ((hasCredentials && !currentPassword) || !newPassword || !confirmPassword){
                    toast.error("Please fill in all fields.");
                    return;
                }
                if (currentPassword == newPassword){
                    toast.error("New password cannot be the same as current password.");
                    return;
                }
                if (newPassword !== confirmPassword){
                    toast.error("New password and confirm password do not match.");
                    return;
                }
                setLoading(true);
                if (hasCredentials){
                    const result = await authClient.changePassword({
                        newPassword,
                        currentPassword,
                        revokeOtherSessions: true,
                    });
                    console.log(result);
                    if (result.error) {
                        if (result.error.code == "INVALID_PASSWORD"){
                            toast.error("Current password is incorrect.");
                        } else {
                            toast.error(result.error.message);
                        }
                    } else {
                        toast.success("Password updated successfully.");
                        setOpen(false)
                    }
                } else {
                    await setPassword(newPassword);
                    toast.success("Password set successfully.");
                    setHasCredentials(true);
                    setOpen(false);
                }
                setLoading(false);
            }}>
                <FieldSet>
                    <FieldGroup className="gap-4">
                        <Field className="gap-2">
                            <FieldLabel htmlFor="current-password">Current password</FieldLabel>
                            <Input disabled={loading || !hasCredentials} id="current-password" name="currentPassword" type="password" className="w-full" required />
                            {!hasCredentials && <FieldDescription>Not required as you do not have a password yet.</FieldDescription>}
                        </Field>
                        <Field className="gap-2">
                            <FieldLabel htmlFor="new-password">New password</FieldLabel>
                            <Input disabled={loading} id="new-password" name="newPassword" type="password" className="w-full" required />
                            <FieldDescription>Password must be at least 8 characters long.</FieldDescription>
                        </Field>
                        <Field className="gap-2">
                            <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
                            <Input disabled={loading} id="confirm-password" name="confirmPassword" type="password" className="w-full" required />
                            <FieldDescription>Re-enter new password to confirm.</FieldDescription>
                        </Field>
                    </FieldGroup>
                </FieldSet>
            <DialogFooter className="mt-6">
                <Button variant={"ghost"} type="button" onClick={() => setOpen(false)} disabled={loading}>
                    Close
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Spinner/>}
                    Save Changes
                </Button>
            </DialogFooter>
            
            </form>
        </DialogContent>
    </Dialog>
}