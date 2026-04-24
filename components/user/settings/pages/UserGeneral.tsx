import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { User } from "better-auth"
import { LaptopMinimal, LogOut, Moon, Trash } from "lucide-react"
import { Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useState } from "react"

export default function UserGeneral({user, pageConfiguredChanges, setPageConfiguredChanges}:{user: User, pageConfiguredChanges: any, setPageConfiguredChanges: (changes: any) => void}){
    const {theme, setTheme} = useTheme();
    const router = useRouter();
    const [name, setName] = useState(pageConfiguredChanges.name || user.name);
    const [email, setEmail] = useState(pageConfiguredChanges.email || user.email);
    useEffect(()=>{
        if (Object.keys(pageConfiguredChanges).length == 0){
            setName(user.name);
            setEmail(user.email);
        }
    }, [pageConfiguredChanges])

    return <>
        <FieldSet className="w-full">
            <FieldGroup className="w-full gap-4">
                <div className="flex items-center gap-4 mb-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <img className="rounded-lg! border border-zinc-400 dark:border-none min-w-22 min-h-22 shrink-0" src={user.image || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${user.name}`}/>
                            </span> 
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start">
                            Changing profile pictures is coming soon.
                        </TooltipContent>
                    </Tooltip>
                    <Field className="gap-2">
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input required id="name" name={"name"} value={name} onChange={(e) => {
                            setPageConfiguredChanges({ ...pageConfiguredChanges, name: e.target.value });
                            setName(e.target.value)
                        }} autoComplete="off" className="dark:placeholder:text-white/50" placeholder={user.name}  />
                    </Field>
                </div>
                <Field className="gap-2">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Input disabled required id="email" name={"email"} value={email} autoComplete="off" className="dark:placeholder:text-white/50" placeholder={user.email}  />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            Email address cannot be changed here. Please contact support if you need to update your email. 
                        </TooltipContent>
                    </Tooltip>
                </Field>
                <Field className="gap-2">
                    <FieldLabel htmlFor="theme">Theme</FieldLabel>
                    <Select required name="theme" value={theme} onValueChange={(value) => setTheme(value)}>
                        <SelectTrigger id="theme" className="w-full">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={"light"}><Sun/> Light</SelectItem>
                            <SelectItem value={"dark"}><Moon/> Dark</SelectItem>
                            <SelectItem value={"system"}><LaptopMinimal/> System</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="gap-2">
                    <FieldTitle>Danger zone</FieldTitle>
                    <FieldDescription>Be careful with these actions. They cannot be undone.</FieldDescription>
                    <div className="flex gap-2 mt-2">
                        <Button onClick={async ()=>{
                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push("/auth/log-in");
                                    },
                                },
                            });
                        }} variant="secondary" className=""><Trash/> Delete account</Button>
                        <Button onClick={async ()=>{
                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push("/auth/log-in");
                                    },
                                },
                            });
                        }} variant="secondary" className=""><Trash/> Clear data</Button>
                        <div className="flex-1"/>
                        <Button onClick={async ()=>{
                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push("/auth/log-in");
                                    },
                                },
                            });
                        }} variant="destructive" className=""><LogOut/> Log out</Button>
                    </div>
                </Field>
            </FieldGroup>
        </FieldSet>
        <div className="flex-1"/>
    </>
}