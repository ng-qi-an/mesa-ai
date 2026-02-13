'use client';
import CreateClassDialog from "@/components/CreateClassDialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ChevronDown, Circle, Computer, DraftingCompass, Ellipsis, ExternalLink, Eye, Globe, LaptopMinimal, Moon, Plus, Presentation, Scroll, Settings2, Sun, Trash } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function DashboardPage(){
    const router = useRouter()
    const { data:session } = authClient.useSession();
    const { theme, setTheme } = useTheme();
    const [showCreate, setShowCreate] = useState(false);
    const classes = [
        {
            name: 'Geography',
            icon: Globe,
            theme: "green",
            description: 'Made by you'
        }, 
        {
            name: 'History',
            icon: Scroll,
            theme: "orange",
            description: 'Made by you'
        },
        {
            name: 'Mathematics',
            icon: DraftingCompass,
            theme: "red",
            description: 'Made by you'
        },

    ]
    return session && <div className="w-full h-screen flex flex-col items-center py-12 px-6 md:px-8">
        <div className="w-full max-w-5xl">
            <div className="flex items-center w-full justify-between">
                <h1 className="text-2xl font-medium">Mesa AI</h1>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={'ghost'} size={"icon-lg"} className={"text-base"}>
                            <img style={{height: 30, width: 30}} className="rounded-sm" src={session.user.image || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${session.user.name}`}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[150px]">
                        <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>Account settings</DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-[150px]">
                                <DropdownMenuCheckboxItem checked={theme === 'light'} onCheckedChange={() => setTheme('light')}><Sun/> Light</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={theme === 'dark'} onCheckedChange={() => setTheme('dark')}><Moon/> Dark</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={theme === 'system'} onCheckedChange={() => setTheme('system')}><LaptopMinimal/> System</DropdownMenuCheckboxItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem variant="destructive" onClick={async ()=>{
                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push("/auth/log-in"); // redirect to login page
                                    },
                                },
                            });
                        }}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="w-full flex flex-col grid sm:grid-cols-2 lg:grid-cols-3 mt-6 md:mt-10 gap-4">
                {classes.map((_class, index)=>{
                    return <Card key={index} className="group relative hover:bg-secondary/40 dark:hover:bg-secondary/30 dark:hover:shadow-none hover:shadow-sm hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer rounded-md">
                        <div className={`absolute h-full top-0 right-0 w-1.5 transition-all ${_class.theme} bg-primary`}/>
                        <CardHeader>
                            <div className="p-4 bg-secondary w-max rounded-lg">
                                <_class.icon/>
                            </div>
                            <CardTitle className="mt-2 relative flex justify-between items-center">
                                {_class.name}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="opacity-100 absolute z-20 right-0" size={'icon-sm'} variant={'ghost'}>
                                            <Ellipsis/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[150px]">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem><ExternalLink/> View</DropdownMenuItem>
                                        <DropdownMenuItem><Settings2/> Configure</DropdownMenuItem>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem variant="destructive"><Trash/> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardTitle>
                            <CardDescription>{_class.description}</CardDescription>
                        </CardHeader>
                    </Card>
                })}
                <Card onClick={()=> setShowCreate(true)} className="relative hover:bg-secondary/40 dark:hover:bg-secondary/30 dark:hover:shadow-none hover:shadow-sm hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer rounded-md justify-center">
                    <CardHeader>
                        <div className="p-4 bg-secondary w-max rounded-lg">
                            <Plus/>
                        </div>
                        <CardTitle className="mt-2 text-lg">Add a class</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        </div>
        <CreateClassDialog showCreate={showCreate} setShowCreate={setShowCreate}/>
        {/* <Button onClick={async ()=>{
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/auth/log-in"); // redirect to login page
                    },
                },
            });
        }}>Log out</Button> */}
    </div>
}