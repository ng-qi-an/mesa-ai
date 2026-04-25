import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Construction } from "lucide-react";

export default function UserChats(){
    return <Empty>
        <EmptyHeader>
            <EmptyMedia variant={"icon"}>
                <Construction/>
            </EmptyMedia>
            <EmptyTitle>In the works!</EmptyTitle>
            <EmptyDescription>We're working on making chat settings more customizable.</EmptyDescription>
        </EmptyHeader>
    </Empty>
}