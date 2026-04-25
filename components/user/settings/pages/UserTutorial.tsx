import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Construction } from "lucide-react";

export default function UserTutorial(){
    return <Empty>
        <EmptyHeader>
            <EmptyMedia variant={"icon"}>
                <Construction/>
            </EmptyMedia>
            <EmptyTitle>Coming soon...</EmptyTitle>
            <EmptyDescription>Tutorials are currently being developed. Check back later!</EmptyDescription>
        </EmptyHeader>
    </Empty>
}