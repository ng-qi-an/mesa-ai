import { SidebarGroupLabel, SidebarGroup, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton, SidebarMenu } from "@/components/ui/sidebar";
import { BookOpen, Home, MessageSquare, Settings2 } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function MainSidebarNavigation(){
    const links = [{
        name: "Dashboard",
        href: "",
        icon: Home
    }, {
        name: "Chat",
        href: "/chats",
        icon: MessageSquare
    }, {
        name: "Guided Study",
        href: "/guided-study",
        icon: BookOpen
    }, {
        name: "Preferences",
        href: "/preferences",
        icon: Settings2
    }]
    const {id} = useParams();
    const pathname = usePathname();
    const router = useRouter();
    return <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu>
                {links.map((link)=>{
                    return <SidebarMenuItem key={link.name}>
                        <SidebarMenuButton onClick={()=> router.push(`/dashboard/class/${id}${link.href}`)} tooltip={link.name} isActive={`/dashboard/class/${id}${link.href}` === pathname}>
                                <link.icon/>
                                {link.name}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                })}
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
}