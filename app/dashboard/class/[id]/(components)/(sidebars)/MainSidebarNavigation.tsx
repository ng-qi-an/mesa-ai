import { SidebarContent, SidebarGroupLabel, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, MessageSquare, Settings2 } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

export default function MainSidebarNavigation(){
    const links = [{
        name: "Dashboard",
        href: "",
        icon: Home
    }, {
        name: "Chat",
        href: "/chat",
        icon: MessageSquare
    }, {
        name: "Preferences",
        href: "/preferences",
        icon: Settings2
    }]
    const {id} = useParams();
    const pathname = usePathname();
    return <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            {/* <SidebarGroupAction>
                <Plus /> <span className="sr-only">Add Project</span>
            </SidebarGroupAction> */}
            <SidebarGroupContent className="flex flex-col gap-1">
                {links.map((link)=>{
                    return <SidebarMenuItem key={link.name}>
                        <SidebarMenuButton asChild isActive={`/dashboard/class/${id}${link.href}` === pathname}>
                            <a href={link.href}>
                                <link.icon/>
                                {link.name}
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                })}
            </SidebarGroupContent>
        </SidebarGroup>
    </SidebarContent>
}