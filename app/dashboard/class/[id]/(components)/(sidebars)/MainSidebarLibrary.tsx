import { SidebarGroupLabel, SidebarGroup, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton, SidebarMenu } from "@/components/ui/sidebar";
import { FolderOpen, ListTodo, Map, Notebook, WalletCards } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

export default function MainSidebarLibrary(){
    const links = [{
        name: "Drive",
        href: "/drive",
        icon: FolderOpen
    }, {
        name: "Notebooks",
        href: "/notebooks",
        icon: Notebook
    }, {
        name: "Flashcards",
        href: "/flashcards",
        icon: WalletCards
    }, {
        name: "Mindmaps",
        href: "/mindmaps",
        icon: Map
    }, {
        name: "Quizzes",
        href: "/quizzes",
        icon: ListTodo
    }]
    const {id} = useParams();
    const pathname = usePathname();
    const router = useRouter();
    return <SidebarGroup>
        <SidebarGroupLabel>Library</SidebarGroupLabel>
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