'use client';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import PageHeader from "./(components)/PageHeader";
import { ArrowRight, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "nextjs-toploader/app";
import { useClass } from "@/components/providers/class-provider";

export default function Page() {
    const router = useRouter();
    const {_class} = useClass();
    return <>
        <PageHeader pages={[{name: "Dashboard"}]} actionsClassName="ml-0 w-full"/>
        <Empty>
                <EmptyHeader>
                    <EmptyMedia variant={"icon"}> 
                        <Construction/>
                    </EmptyMedia>
                    <EmptyTitle>
                        Sorry... not done yet!
                    </EmptyTitle>
                    <EmptyDescription>
                        The dashboard view couldn't be completed in time. Checkout notebooks though!
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant={"raised"} onClick={()=> router.push(`/dashboard/class/${_class?.id}/notebooks`)}>Go to Notebooks <ArrowRight/></Button>
                </EmptyContent>
        </Empty>
    </>
}