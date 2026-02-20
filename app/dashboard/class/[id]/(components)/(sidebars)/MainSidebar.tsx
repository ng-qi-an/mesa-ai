'use client';

import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ClassSelect } from "@/lib/schemas/schema";
import MainSidebarHeader from "./MainSidebarHeader";
import MainSidebarFooter from "./MainSidebarFooter";
import MainSidebarNavigation from "./MainSidebarNavigation";
import MainSidebarLibrary from "./MainSidebarLibrary";
import MainSidebarTopics from "./MainSidebarTopics";

export default function MainSidebar({_class, classes}: {_class: ClassSelect, classes: ClassSelect[]}) {
    const {data:session} = authClient.useSession();
    return session && <Sidebar collapsible="icon" className={_class.theme}>
        <MainSidebarHeader _class={_class} classes={classes}/>
        <SidebarContent>
            <MainSidebarNavigation/>
            <MainSidebarLibrary/>
            <MainSidebarTopics/>
        </SidebarContent>
        <MainSidebarFooter user={session.user}/>
        <SidebarRail/>
    </Sidebar>
}