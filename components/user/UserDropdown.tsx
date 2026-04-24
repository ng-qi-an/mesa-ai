'use client';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {   useSidebar } from "@/components/ui/sidebar";
import { ChevronsUpDown, LaptopMinimal, Moon, Sun } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { User } from "better-auth";
import AccountSettingsDialog from "./settings/AccountSettingsDialog";
import { useState } from "react";

export default function UserDropdown({user: _user, children, isMobile, sidebarState}: {user: User, children: React.ReactNode, isMobile?: boolean, sidebarState?: any}) {
    const router = useRouter();
    const {theme, setTheme} = useTheme();
    const user = _user || authClient.useSession().data?.user;
    const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
    return <>
        <AccountSettingsDialog user={user} open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}/>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
                <DropdownMenuContent                             
                className="w-(--radix-dropdown-menu-trigger-width) min-w-55 space-y-1 py-2"
                side={isMobile ? "bottom" : sidebarState == "collapsed" ? "right" : "bottom"}
                sideOffset={isMobile ? 4 : sidebarState == "collapsed"? 14 : 4}
                align={isMobile ? "center" : sidebarState == "collapsed" ? "end" : "center"}>
                <DropdownMenuItem onClick={() => setIsAccountSettingsOpen(true)}>
                    Account settings
                </DropdownMenuItem>
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
                                router.push("/auth/log-in");
                            },
                        },
                    });
                }}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
}