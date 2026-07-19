import { CircleQuestionMark, FileIcon, ListTodo, MessageSquare, MoreVertical } from "lucide-react";
import { LibraryItemType } from "./LibraryItemGroup";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import ChatMessagesPanel from "../(apps)/(chats)/ChatMessagesPanel";
import { useTabs } from "@/components/providers/tabs-provider";
import QuizPanel from "../(apps)/(quiz)/QuizPanel";
import SourceItemDropdown from "./SourceItemDropdown";
import { useNotebook } from "@/components/providers/notebook-provider";

export default function LibraryItem({item}: {item: LibraryItemType}){
    const {addOrGoToTab, setSelectedSideTab} = useTabs();
    const Icon = item.type == "quizzes" ? ListTodo : item.type == "sources" ? FileIcon : item.type == "chats" ? MessageSquare : CircleQuestionMark;
    const ItemDropdown = item.type == "sources" ? SourceItemDropdown : null
    const { noteId, mainChatId } = useNotebook();
    return <div className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-3 pr-1 py-2 rounded-md w-full relative"
        onClick={()=>{
            if (item.type == "chats"){
                if (item.id == mainChatId) {
                    setSelectedSideTab("chat");
                } else {
                    addOrGoToTab({icon: MessageSquare, label: item.label, id: item.id, component: <ChatMessagesPanel chatId={item.id} chatName={item.label} />}, "side")
                }
            } else if (item.type == "quizzes"){
                addOrGoToTab({icon: ListTodo, label: item.label, id: item.id, component: <QuizPanel quizId={item.id} />}, "side")
            }
        }}
    >
        <Icon className="text-muted-foreground group-hover:text-foreground size-4 shrink-0"/>
        <div className="flex min-w-0 flex-col pl-1 flex-1">
            <p className="truncate text-sm font-medium">
                {item.label}
            </p>
            <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                {item.description}
            </p>
        </div>
        {ItemDropdown && (
                <Tooltip>
                    <TooltipContent side="bottom" align="end">
                        <p>More options</p>
                    </TooltipContent>
                    <TooltipTrigger asChild>
                        <ItemDropdown id={item.id} noteId={noteId}>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                                <MoreVertical/>
                            </Button>
                        </ItemDropdown>
                    </TooltipTrigger>
                </Tooltip>
        )}
    </div>
}