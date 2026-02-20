import { User } from "better-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ClassSelect } from "@/lib/schemas/schema";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronsUpDown } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useRouter } from "next/navigation";

export default function MainSidebarHeader({_class, classes}: {_class: ClassSelect, classes: ClassSelect[]}) {
    const router = useRouter();
    return <SidebarHeader className="pt-3">
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className={cn(_class.theme, "bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg")}>
                            <DynamicIcon name={_class.icon as any} className="size-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-medium">{_class.name}</span>
                            <span className="text-xs text-muted-foreground">Mesa ai</span>
                        </div>
                        <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) space-y-1 py-2"
                        align="start"
                    >
                        <DropdownMenuItem
                            key={_class.id}
                            onSelect={() => router.push(`/dashboard`)}
                        >
                                <div className={cn(_class.theme, "bg-secondary text-secondary-foreground flex aspect-square size-8 items-center justify-center rounded-lg")}>
                                <ArrowLeft className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">Home</span>
                                <span className="text-xs text-muted-foreground">Return to all classes</span>
                            </div>
                        </DropdownMenuItem>
                        {classes.map((_classx)=>{
                        return _class.id != _classx.id && <DropdownMenuItem
                            key={_classx.id}
                            onSelect={() => router.push(`/dashboard/class/${_classx.id}`)}
                            className=""
                        >
                                <div className={cn(_classx.theme, "bg-primary text-primary-foreground! group-hover:text-primary-foreground! flex aspect-square size-8 items-center justify-center rounded-lg")}>
                                <DynamicIcon name={_classx.icon as any} className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">{_classx.name}</span>
                                <span className="text-xs text-muted-foreground">{_classx.subject}</span>
                            </div>
                        </DropdownMenuItem>
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarHeader>
}