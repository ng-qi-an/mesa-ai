import { CircleQuestionMark, FileIcon, ListTodo, MessageSquare, MoreVertical, WalletCards } from "lucide-react";
import { LibraryItemType } from "./LibraryItemGroup";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function LibraryItem({item}: {item: LibraryItemType}){
    const Icon = item.type == "quizzes" ? ListTodo : item.type == "sources" ? FileIcon : item.type == "chats" ? MessageSquare : CircleQuestionMark;
    return <div className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-3 pr-1 py-2 rounded-md w-full relative">
        <Icon className="text-muted-foreground group-hover:text-foreground size-4 shrink-0"/>
        <div className="flex min-w-0 flex-col pl-1 flex-1">
            <p className="truncate text-sm font-medium">
                {item.label}
            </p>
            <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                {item.description}
            </p>
        </div>
        <Tooltip>
            <TooltipContent side="bottom" align="end">
                <p>More options</p>
            </TooltipContent>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <MoreVertical/>
                </Button>
            </TooltipTrigger>
        </Tooltip>
    </div>
}