import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Account } from "better-auth";
import { ExternalLink, Unlink, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AccountCard({account, linked, syncAccounts}:{account: Partial<Account>, linked: boolean, syncAccounts: () => void}){
    return <div className="bg-card flex items-center gap-2 p-3 rounded-lg">
        <div className="flex flex-col pl-1">
            <p className="font-medium">{account?.providerId == "google" && "Google Sign-In"}</p>
            <p className="text-muted-foreground">{linked ? `Linked` : "Not linked"}</p>
        </div>
        <div className="flex-1"/>
        {linked ? <Button variant={"secondary"} onClick={async()=>{
            const {data, error} = await authClient.unlinkAccount({
                providerId: account.providerId!,
                accountId: account.accountId!
            });
            if (error) {
                toast.error("Failed to unlink account: " + error.message);
                return;
            }
            syncAccounts();
        }}>Remove <X/></Button> : <Button onClick={async ()=> {
            const {data, error} = await authClient.linkSocial({
                provider: "google", // Provider to link
                callbackURL: window.location.href // Callback URL after linking completes
            });
            if (error) {
                toast.error("Failed to link account: " + error.message);
            }
        }}>Link <ExternalLink/></Button>}
    </div>
}