'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileBrowser from "@/components/file-browser/FileBrowser";
import { FileBrowserProvider } from "@/components/providers/file-browser-provider";
import PageHeader from "../../(components)/PageHeader";
import CreateNewButton from "@/components/file-browser/CreateNewButton";
import { FileSelect } from "@/lib/schemas/schema";
import { useRouter } from "next/navigation";
import { useClass } from "@/components/providers/class-provider";
import FileBrowserBreadcrumbs from "@/components/file-browser/FileBrowserBreadcrumbs";
import { ChevronDown, Search } from "lucide-react";

export default function NestPage({nests, files, revalidateData}: {nests: FileSelect[], files: FileSelect[], revalidateData: (...args: any[]) => Promise<void>}) {
    const router = useRouter();
    const {_class} = useClass();
    function setNests(nests: FileSelect[]) {
        router.push(`/dashboard/class/${_class.id}/drive/${nests.map(n => n.id).join("/")}`);
    }
    return <FileBrowserProvider nests={nests} setNests={setNests} files={files} revalidateData={revalidateData}>
        <PageHeader pages={[{name: "Drive"}]} actionsClassName="ml-0 w-full">
            <div className="flex-1"/>
            <Input className="w-full max-w-[300px] mr-1 border-0 px-3" placeholder="Search for files"/>
            <CreateNewButton nests={nests}>
                <Button variant={'secondary'} className="mr-2">
                    Create new
                    <ChevronDown/>
                </Button>
            </CreateNewButton>
        </PageHeader>
        <div className="w-full h-full flex flex-col px-8 py-6">
            <FileBrowserBreadcrumbs nests={nests} setNests={setNests} classNames={{link: "text-2xl font-medium", page: "text-2xl font-semibold", separator: "scale-120"}}/>
            <p className="text-muted-foreground mt-1 mb-6">{nests[0] ? `Contains ${files.length} item${files.length == 1 ? "" : "s"}` : "Manage documents and files for this class"}</p>
                <FileBrowser files={files.map(f => ({...f, key: f.id}))} onItemSelect={(file)=>{
                    if (file.contentType == "application/x-directory") {
                        setNests([...nests, file]);
                    }
                    console.log("Selected file:", file);
                }}/>
        </div>
    </FileBrowserProvider>
}