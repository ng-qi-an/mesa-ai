'use client';
import PageHeader from "../../(components)/PageHeader";
import { ArrowRight, ChevronDown, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useRouter } from "next/navigation";
import { useClass } from "@/components/providers/class-provider";

export default function Page(){
    const {isMobile} = useSidebar();
    const { _class } = useClass();
    const router = useRouter();
    return <>
        <PageHeader pages={[{name: "Topics"}]} actionsClassName="ml-0 w-full">
            <div className="flex-1"/>
            <Input className="w-full max-w-[300px] mr-1 border-0 px-3" placeholder="Search for items"/>
            <Button disabled={true} variant={isMobile ? "ghost" : "secondary"} size={isMobile ? "icon" : "default"} className="mr-2" onClick={async()=>{}}>{!isMobile && "Create new"}<ChevronDown/></Button>
        </PageHeader>
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant={"icon"}> 
                    <Construction/>
                </EmptyMedia>
                <EmptyTitle>
                    In the works!
                </EmptyTitle>
                <EmptyDescription>
                    Topic views are on the roadmap! In the meantime, organise topics with Notebooks.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant={"raised"} onClick={()=> router.push(`/dashboard/class/${_class?.id}/notebooks`)}>Go to Notebooks <ArrowRight/></Button>
            </EmptyContent>
        </Empty>
    </>
}