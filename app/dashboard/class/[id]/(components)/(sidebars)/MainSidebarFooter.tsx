import { User } from "better-auth";
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { ChevronsUpDown } from "lucide-react";
import UserDropdown from "@/components/user/UserDropdown";
import UsageButton from "@/components/usage/UsageButton";
import { useUsage } from "@/components/providers/usage-provider";

export default function MainSidebarFooter({user}: {user: User}) {
    const {isMobile, state} = useSidebar();
    const { getCurrentCreditUsage, billingCycle } = useUsage();
    return user && <SidebarFooter className="pb-3">
        <SidebarMenu>
            {state == "collapsed" && <SidebarMenuItem>
                <UsageButton/>
            </SidebarMenuItem>}
            <SidebarMenuItem>
                <UserDropdown user={user} isMobile={isMobile} sidebarState={state}>
                    <SidebarMenuButton                             
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className={"flex size-8 items-center justify-center"}>
                            <img style={{height: '100%', width: '100%'}} className="rounded-lg border border-zinc-400 dark:border-none" src={user.image || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${user.name}`}/>
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {Math.floor(getCurrentCreditUsage())} of {billingCycle.creditLimit} credits
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                </UserDropdown>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarFooter>
}