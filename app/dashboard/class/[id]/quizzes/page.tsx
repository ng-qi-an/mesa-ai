'use client';
import PageHeader from "../(components)/PageHeader";
import { ArrowRight, Construction, Plus } from "lucide-react";
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
        <PageHeader pages={[{name: "Quizzes"}]} actionsClassName="ml-0 w-full">
            <div className="flex-1"/>
            <Input className="w-full max-w-[300px] mr-1 border-0 px-3" placeholder="Search for quizzes"/>
            <Button disabled={true} variant={isMobile ? "ghost" : "secondary"} size={isMobile ? "icon" : "default"} className="mr-2" onClick={async()=>{}}>{!isMobile && "Create new"}<Plus/></Button>
        </PageHeader>
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant={"icon"}> 
                    <Construction/>
                </EmptyMedia>
                <EmptyTitle>
                    Work in progress
                </EmptyTitle>
                <EmptyDescription>
                    Standalone quizzes are coming soon. In the meantime, create quizzes within Notebooks!
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant={"raised"} onClick={()=> router.push(`/dashboard/class/${_class?.id}/notebooks`)}>Go to Notebooks <ArrowRight/></Button>
            </EmptyContent>
        </Empty>
    </>
}