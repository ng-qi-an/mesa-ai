'use client';

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ClassSelect } from "@/lib/schemas/schema";
import MainSidebarHeader from "./MainSidebarHeader";
import MainSidebarFooter from "./MainSidebarFooter";
import MainSidebarNavigation from "./MainSidebarNavigation";
import MainSidebarLibrary from "./MainSidebarLibrary";
import MainSidebarTopics from "./MainSidebarTopics";
import { useClass } from "@/components/providers/class-provider";

export default function MainSidebar({classes}: {classes: ClassSelect[]}) {
    const {data:session} = authClient.useSession();
    const {_class} = useClass();
    return session && <Sidebar collapsible="icon" className={_class.theme} id="classSidebar">
        <MainSidebarHeader _class={_class} classes={classes}/>
        <SidebarContent>
            <MainSidebarNavigation/>
            <MainSidebarLibrary/>
            <MainSidebarTopics/>
        </SidebarContent>
        <MainSidebarFooter user={session.user}/>
    </Sidebar>
}