import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Passkey } from "@better-auth/passkey";
import { Account } from "better-auth";
import { ExternalLink, MoreVertical, Pen, Unlink, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PasskeyNameDialog from "../PasskeyNameDialog";
import { relativeTime } from "@/lib/utils/relativeTime";

export default function PasskeyCard({passkey}:{passkey: Passkey}){
    const [renamePasskey, setRenamePasskey] = useState(false);
    return <>
    <PasskeyNameDialog open={renamePasskey} setOpen={setRenamePasskey} onSave={async(name) => {
        const {data, error} = await authClient.passkey.updatePasskey({id: passkey.id, name});
        if (error) {
            throw Error("Failed to rename passkey: " + error.message);
        }
    }}/>
    <div className="bg-card flex items-center gap-2 p-3 rounded-lg">
        <div className="flex flex-col pl-1">
            <p className="font-medium">{passkey.name}</p>
            <p className="text-muted-foreground">Added {relativeTime(passkey.createdAt)}</p>
        </div>
        <div className="flex-1"/>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={'icon'}><MoreVertical/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={()=> setRenamePasskey(true)}><Pen/> Rename</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={async()=> {
                    try {
                        const {data, error} = await authClient.passkey.deletePasskey({id: passkey.id});
                        if (error) {
                            throw Error(error.message);
                        }
                    } catch (error) {
                        toast.error("Failed to delete passkey: " + (error as Error).message);
                    }
                }}><X/> Remove</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
    </>
}