'use client';
import { useClass } from "@/components/providers/class-provider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";

export default function PageHeader({pages, children, sidebarButton=<SidebarTrigger className="mr-2" />, titleEditable, onTitleSubmit, actionsClassName}: {pages: {name: string, href?: string}[], sidebarButton?: React.ReactNode, children?: React.ReactNode, titleEditable?: boolean, onTitleSubmit?: (newTitle: string) => void, actionsClassName?: string}) {
    const {_class} = useClass();
    const router = useRouter();
    const [editingTitle, setEditingTitle] = useState(false);
    return <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear relative">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
            {sidebarButton}
            <Breadcrumb className="min-w-0 flex-1">
              <BreadcrumbList className="flex-nowrap">
              {pages.map((page, index) => index == pages.length - 1 ? 
                    <BreadcrumbItem key={index} className="w-full ">
                        {!editingTitle ?
                            <BreadcrumbPage onClick={()=> titleEditable && setEditingTitle(true)} className={`font-medium ${titleEditable && 'cursor-select border border-transparent hover:border-border py-2 rounded-md px-2.5  w-full max-w-[300px] truncate'}`}>{page.name}</BreadcrumbPage>
                        : <Input 
                            autoFocus
                            defaultValue={page.name} 
                            onBlur={(e) => {
                                onTitleSubmit?.(e.target.value);
                                setEditingTitle(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    onTitleSubmit?.(e.currentTarget.value);
                                    setEditingTitle(false);
                                } else if (e.key === "Escape") {
                                    e.currentTarget.value = page.name;
                                    setEditingTitle(false);
                                }
                            }}
                            className="focus:border-foreground! text-foreground text-sm w-full max-w-[300px] font-medium focus:ring-0 focus-visible:ring-0 bg-transparent" 
                        />}
                    </BreadcrumbItem>
                : <Fragment key={index}>
                    <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={"#"} onClick={()=> router.push(`/dashboard/class/${_class.id}/${page.href}`)}>
                            {page.name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />              
                </Fragment>)}
              </BreadcrumbList>
            </Breadcrumb>
            <div className={cn("ml-auto flex items-center gap-2", actionsClassName)}>
                {children}
            </div>
        </div>
    </header>
}