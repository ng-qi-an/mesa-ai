'use client';
import CreateClassDialog from "@/app/dashboard/(components)/CreateClassDialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ChevronDown, Circle, Computer, DraftingCompass, Ellipsis, ExternalLink, Eye, Globe, LaptopMinimal, Moon, Plus, Presentation, Scroll, Settings2, Sun, Trash, Trash2Icon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "nextjs-toploader/app";
import React, { Fragment, useEffect, useState } from "react";
import { ClassSelect } from "@/lib/schemas/schema";
import getAllClassesServer from "@/lib/actions/classes/getAllClasses";
import { DynamicIcon } from "lucide-react/dynamic";
import deleteClassServer from "@/lib/actions/classes/deleteClass";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import revalidateData from "@/lib/actions/revalidateData";
import UserDropdown from "@/components/user/UserDropdown";

export default function DashboardPage({classes}: {classes: ClassSelect[]}) {
    const router = useRouter()
    const { data:session } = authClient.useSession();
    const { theme, setTheme } = useTheme();
    const [showCreate, setShowCreate] = useState(false);
    return session && <div className="w-full h-screen flex flex-col items-center py-12 px-6 md:px-8">
        <div className="w-full max-w-5xl">
            <div className="flex items-center w-full justify-between">
                <h1 className="text-2xl font-medium">Mesa AI</h1>
                <UserDropdown user={session.user}>
                    <Button variant={'ghost'} size={"icon-lg"} className={"text-base"}>
                        <img style={{height: 30, width: 30}} className="rounded-sm" src={session!.user.image || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${session!.user.name}`}/>
                    </Button>
                </UserDropdown>
            </div>
            <div className="w-full flex flex-col grid sm:grid-cols-2 lg:grid-cols-3 mt-6 md:mt-10 gap-4">
                {classes.map((_class, index)=>{
                    return <AlertDialog key={index} >
                        <Card onClick={()=> router.push(`/dashboard/class/${_class.id}`)} key={index} className="group relative hover:bg-secondary/40 dark:hover:bg-secondary/30 dark:hover:shadow-none hover:shadow-sm hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer rounded-md">
                            <div className={`absolute h-full top-0 right-0 w-1.5 transition-all ${_class.theme} bg-primary`}/>
                            <CardHeader>
                                <div className="p-4 bg-secondary w-max rounded-lg">
                                    <DynamicIcon name={_class.icon as any}/>
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
                                            <DropdownMenuItem onClick={(e)=> {e.stopPropagation(); router.push(`/dashboard/class/${_class.id}`)}}><ExternalLink/> View</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e)=> {e.stopPropagation(); router.push(`/dashboard/class/${_class.id}/settings`)}}><Settings2/> Configure</DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem variant="destructive" onClick={async (e)=>{
                                                    e.stopPropagation();
                                                }}><Trash/> Delete</DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardTitle>
                                <CardDescription className="capitalize">{_class.subject}</CardDescription>
                            </CardHeader>
                        </Card>
                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                <Trash2Icon />
                                </AlertDialogMedia>
                                <AlertDialogTitle>Delete class?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will permanently delete this class and all class materials.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={async()=> {
                                    await deleteClassServer(_class.id)
                                    await revalidateData("/dashboard");
                                }} variant="destructive">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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