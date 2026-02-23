'use client';
import { useClass } from "@/components/providers/class-provider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function PageHeader({pages, children, actionsClassName}: {pages: {name: string, href?: string}[], children?: React.ReactNode, actionsClassName?: string}) {
    const {_class} = useClass();
    const router = useRouter();
    return <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear relative">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
            <SidebarTrigger className="mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
              {pages.map((page, index) => index == pages.length - 1 ? 
                    <BreadcrumbItem key={index}>
                        <BreadcrumbPage className="font-medium">{page.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                : <>
                    <BreadcrumbItem key={index} className="hidden md:block">
                        <BreadcrumbLink href={"#"} onClick={()=> router.push(`/class/${_class.id}/${page.href}`)}>
                            {page.name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />              
                </>)}
              </BreadcrumbList>
            </Breadcrumb>
            <div className={cn("ml-auto flex items-center gap-2", actionsClassName)}>
                {children}
            </div>
        </div>
    </header>
}