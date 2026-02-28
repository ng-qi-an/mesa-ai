'use client';
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileSelect } from "@/lib/schemas/schema";
import { Button } from "../ui/button";

export default function FileBrowserBreadcrumbs({nests, setNests, classNames}: {nests: FileSelect[], setNests: (nests: FileSelect[]) => void, classNames?: {link?: string, separator?: string, page?: string}}) {
    return <Breadcrumb>
        <BreadcrumbList>
            {nests[0] && <>
                <BreadcrumbItem>
                    <BreadcrumbLink onClick={()=> setNests([])} href="#" className={classNames?.link}>Drive</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className={classNames?.separator}/>
            </>}
            {nests[2] && <>
                <BreadcrumbItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size={'icon-sm'}>
                                <BreadcrumbEllipsis/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-max">
                            {nests.map((n, i) => i < nests.length - 2 ? (
                                <DropdownMenuItem key={i} onClick={()=> setNests(nests.slice(0, i+1))}>
                                    {decodeURIComponent(n.name)}
                                </DropdownMenuItem>
                            ) : null)}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator className={classNames?.separator}/>
            </>}
            {nests[1] && <>
                <BreadcrumbItem>
                    <BreadcrumbLink onClick={()=> setNests(nests.slice(0, nests.length - 1))} href="#" className={classNames?.link}>{decodeURIComponent(nests[nests.length - 2].name)}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className={classNames?.separator}/>
            </>}
            <BreadcrumbItem>
                <BreadcrumbPage className={classNames?.page}>
                    {nests[nests.length - 1] ? decodeURIComponent(nests[nests.length - 1].name) : "Drive"}
                </BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
}