'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { session } from "@/lib/schemas/auth-schema";
import { ClassSelect } from "@/lib/schemas/schema";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown, ChevronsUpDown, Home, LaptopMinimal, Moon, Plus, Sun } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useTheme } from "next-themes";
import Link from "next/link";
import { redirect, useParams, useRouter } from "next/navigation";
import MainSidebarHeader from "./MainSidebarHeader";
import MainSidebarFooter from "./MainSidebarFooter";
import MainSidebarNavigation from "./MainSidebarNavigation";

export default function MainSidebar({_class, classes}: {_class: ClassSelect, classes: ClassSelect[]}) {
    const {theme, setTheme} = useTheme();
    const {data:session} = authClient.useSession();
    const router = useRouter();
    return session && <Sidebar>
        <MainSidebarHeader _class={_class} classes={classes}/>
        <MainSidebarNavigation/>
        <MainSidebarFooter user={session.user}/>
    </Sidebar>
}