import { SidebarGroupLabel, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton, SidebarMenu, SidebarMenuAction } from "@/components/ui/sidebar";
import { BookOpen, MoreVertical, Plus } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import CreateTopicDialog from "../CreateTopicDialog";
import { useClass } from "@/components/providers/class-provider";
import { DynamicIcon } from "lucide-react/dynamic";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MainSidebarTopics(){
    const {id} = useParams();
    const pathname = usePathname();
    const [showCreate, setShowCreate] = useState(false);
    const {_class} = useClass();
    const router = useRouter();
    return <>
    <SidebarGroup>
        <SidebarGroupLabel>Topics</SidebarGroupLabel>
        <SidebarGroupAction onClick={()=>{
            setShowCreate(true)
        }}>
            <Plus /> <span className="sr-only">Add topics</span>
        </SidebarGroupAction>
        <SidebarGroupContent>
            <SidebarMenu>
                {_class.topics.map((topic)=>{
                    return <SidebarMenuItem key={topic.id} className="group">
                        <SidebarMenuButton tooltip={topic.name} onClick={()=> router.push(`/dashboard/class/${id}/topic/${topic.id}`)} isActive={`/dashboard/class/${id}/topic/${topic.id}` === pathname}>
                            <DynamicIcon name={topic.icon as any} className="size-4"/>
                            {topic.name}
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                    <MoreVertical />
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Topic actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                })}
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
    <CreateTopicDialog showCreate={showCreate} setShowCreate={setShowCreate}/>
    </>
}