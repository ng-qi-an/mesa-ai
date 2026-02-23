"use client"

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileBrowserItem, fileColumns } from "./FileBrowserColumns";
import { FileBrowserTable } from "./FileBrowserTable"
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import PageHeader from "../../../(components)/PageHeader";
import CreateNewButton from "./CreateNewButton";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useClass } from "@/components/providers/class-provider";
import { FileSelect } from "@/lib/schemas/schema";

export default function FileBrowser({files, nests}: {files: FileBrowserItem[], nests: FileSelect[]}) {
    console.log("Rendering FileBrowser with files:", files, "and nests:", nests);
    const router = useRouter();
    const {_class} = useClass();
    return <>
        <PageHeader pages={[{name: "Drive"}]} actionsClassName="ml-0 w-full">
            <div className="absolute left-0 flex items-center justify-center w-full">
                <Input className="w-full max-w-[500px] px-4" placeholder="Search for files"/>
            </div>
            <CreateNewButton nests={nests}/>
        </PageHeader>
        <div className="w-full h-full flex flex-col px-8 py-6">
            <Breadcrumb>
                <BreadcrumbList>
                    {nests[0] && <>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={()=> router.push(`/dashboard/class/${_class.id}/drive`)} href="#" className="text-2xl font-medium">Drive</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="scale-120"/>
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
                                        <DropdownMenuItem key={i} onClick={()=> router.push(`/dashboard/class/${_class.id}/drive/${nests.map((n)=> n.id).slice(0, i+1).join('/')}`)}>
                                            {decodeURIComponent(n.name)}
                                        </DropdownMenuItem>
                                    ) : null)}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="scale-120"/>
                    </>}
                    {nests[1] && <>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={()=> router.push(`/dashboard/class/${_class.id}/drive/${nests.map(n => n.id).slice(0, nests.length - 1).join('/')}`)} href="#" className="text-2xl font-medium">{decodeURIComponent(nests[nests.length - 2].name)}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="scale-120"/>
                    </>}
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-2xl font-semibold">
                            {nests[nests.length - 1] ? decodeURIComponent(nests[nests.length - 1].name) : "Drive"}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <p className="text-muted-foreground mt-1 mb-6">{nests[0] ? `Contains ${files.length} item${files.length == 1 ? "" : "s"}` : "Manage documents and files for this class"}</p>
            <FileBrowserTable columns={fileColumns} data={files} onItemSelect={(file)=>{
                if (file.contentType == "application/x-directory") {
                    router.push(`/dashboard/class/${_class.id}/drive/${[...nests.map(n => n.id), file.id].join('/')}`)
                }
                console.log("Selected file:", file);
            }}/>
        </div>
    </>
}

