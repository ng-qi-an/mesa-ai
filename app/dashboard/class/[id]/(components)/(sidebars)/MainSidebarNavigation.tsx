import { SidebarGroupLabel, SidebarGroup, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton, SidebarMenu } from "@/components/ui/sidebar";
import { Home, MessageSquare, Settings2 } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import ClassPrefDialog from "../preferences/ClassPrefDialog";

export default function MainSidebarNavigation(){
    const links = [{
        name: "Dashboard",
        href: "",
        icon: Home
    }, 
    {
        name: "Chat",
        href: "/chats",
        icon: MessageSquare
    }, 
    // {
    //     name: "Guided Study",
    //     href: "/guided-study",
    //     icon: BookOpen
    // }
    ]
    const {id} = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const [showPrefDialog, setShowPrefDialog] = useState(false);
    return <>
        <ClassPrefDialog open={showPrefDialog} onOpenChange={setShowPrefDialog} />
        <SidebarGroup>
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
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setShowPrefDialog(true)}>
                                <Settings2/>
                                Preferences
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    </>
}