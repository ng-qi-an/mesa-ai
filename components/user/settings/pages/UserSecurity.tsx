import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { Account, User } from "better-auth"
import { Edit, Key } from "lucide-react"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useState } from "react"
import ResetPasswordDialog from "../ResetPasswordDialog"
import { toast } from "sonner"
import AccountCard from "./AccountCard"
import PasskeyCard from "./PasskeyCard"
import PasskeyNameDialog from "../PasskeyNameDialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserSecurity({user, pageConfiguredChanges, setPageConfiguredChanges}:{user: User, pageConfiguredChanges: any, setPageConfiguredChanges: (changes: any) => void}){
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const {data: passkeys, isPending: loadingPasskeys, isRefetching: refetchingPasskeys} = authClient.useListPasskeys();
    const [showAddPasskey, setShowAddPasskey] = useState(false);
    async function syncAccounts(){
        setLoadingAccounts(true);
        const {data, error} = await authClient.listAccounts();
        setLoadingAccounts(false);
        if (!data) {
            toast.error("Failed to fetch linked accounts.");
            return setAccounts([]);
        } 
        if (error){
            toast.error("Failed to fetch linked accounts.");
            return setAccounts([]);
        }
        setAccounts(data.filter((x)=> x.providerId !== "credential"));
    }
    useEffect(()=>{
        if (Object.keys(pageConfiguredChanges).length == 0){
            
        }
    }, [pageConfiguredChanges])
    useEffect(()=>{
        syncAccounts();
    }, [])

    return <>
            <PasskeyNameDialog open={showAddPasskey} setOpen={setShowAddPasskey} onSave={async(name) => {
            const { data, error } = await authClient.passkey.addPasskey({name});
            try {
                if (error) {
                    throw Error(error.message);
                }
            } catch (error) {
                throw Error("Failed to add passkey: " + (error as Error).message);
            }
        }}/>
        <FieldSet className="w-full">
            <FieldGroup className="w-full gap-4">
                <Field className="gap-2">
                    <FieldTitle>Password</FieldTitle>
                    <ResetPasswordDialog>
                        <Button variant="secondary" className="w-max!"><Edit/> Change password</Button>
                    </ResetPasswordDialog>
                </Field>
                <Field className="gap-2">
                    <FieldTitle>Social providers</FieldTitle>
                    {loadingAccounts ? <Skeleton className="w-full h-16"/> : <>
                        {accounts.map((account) => {
                            return <AccountCard key={account.id} account={account} linked={true} syncAccounts={syncAccounts}/>
                        })}
                        {accounts.some(account => account.providerId === "google") ? null : <AccountCard account={{providerId: "google"}} linked={false} syncAccounts={syncAccounts}/>}
                    </>}
                </Field>
                <Field className="gap-2">
                    <FieldTitle>Passkeys</FieldTitle>
                    {loadingPasskeys || refetchingPasskeys ? <Skeleton className="w-full h-16"/> : <>
                        {passkeys?.map((passkey) => {
                            return <PasskeyCard key={passkey.id} passkey={passkey}/>
                        })}
                        <Button className="w-max!" onClick={()=> setShowAddPasskey(true)}><Key/> Add passkey</Button>
                    </>}
                </Field>
            </FieldGroup>
        </FieldSet>
        <div className="flex-1"/>
    </>
}