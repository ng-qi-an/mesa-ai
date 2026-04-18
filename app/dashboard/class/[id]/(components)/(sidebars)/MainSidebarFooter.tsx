import { User } from "better-auth";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { ChevronsUpDown, LaptopMinimal, Moon, Sun } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";

export default function MainSidebarFooter({user}: {user: User}) {
    const router = useRouter();
    const {theme, setTheme} = useTheme();
    const { isMobile, state } = useSidebar()
    return user &&  <SidebarFooter className="pb-3">
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton                             
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className={"flex size-8 items-center justify-center"}>
                                <img style={{height: '100%', width: '100%'}} className="rounded-lg border border-zinc-400 dark:border-none" src={user.image || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${user.name}`}/>
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                                <span className="font-medium">{user.name}</span>
                            </div>
                        <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                        <DropdownMenuContent                             
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-55 space-y-1 py-2"
                        side={isMobile ? "bottom" : state == "collapsed" ? "right" : "bottom"}
                        sideOffset={isMobile ? 4 : state == "collapsed"? 14 : 4}
                        align={isMobile ? "center" : state == "collapsed" ? "end" : "center"}>
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
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarFooter>
}