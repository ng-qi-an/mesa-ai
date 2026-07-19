import { CircleQuestionMark, FileIcon, ListTodo, MessageSquare } from "lucide-react";
import { LibraryItemType } from "./LibraryItemGroup";
import ChatMessagesPanel from "../(apps)/(chats)/ChatMessagesPanel";
import { useTabs } from "@/components/providers/tabs-provider";
import QuizPanel from "../(apps)/(quiz)/QuizPanel";
import SourceItemDropdown from "./SourceItemDropdown";
import { useNotebook } from "@/components/providers/notebook-provider";
import ChatActionsDropdown from "../(apps)/(chats)/ChatActionsDropdown";
import QuizActionsDropdown from "@/components/quiz/QuizActionsDropdown";
import { ChatSelect, QuizSelect } from "@/lib/schemas/schema";
import getNotebookItems from "../../(actions)/getNotebookItems";
import { toast } from "sonner";

export default function LibraryItem({item, setItems}: {item: LibraryItemType, setItems: React.Dispatch<React.SetStateAction<Record<string, any[]>>>}){
    const {addOrGoToTab, setSelectedSideTab} = useTabs();
    const Icon = item.type == "quizzes" ? ListTodo : item.type == "sources" ? FileIcon : item.type == "chats" ? MessageSquare : CircleQuestionMark;
    const { noteId, mainChatId } = useNotebook();
    async function reloadLibrary(){
        const raw = await getNotebookItems(noteId);
        if (raw) {
            setItems(raw);
        } else {
            toast.error("Failed to load notebook items. Please refresh and try again.")
        }
    }
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
        {item.type == "sources" ? 
            <SourceItemDropdown id={item.id} noteId={noteId}/>
        : item.type == "chats" ?
            <ChatActionsDropdown chat={{id: item.id, name: item.label} as ChatSelect} onRename={()=> reloadLibrary()} onDelete={()=> reloadLibrary()}/>
        : item.type == "quizzes" ?
            <QuizActionsDropdown quiz={{id: item.id, name: item.label} as QuizSelect} onRename={()=> reloadLibrary()} onDelete={()=> reloadLibrary()}/>
        : <></>}
    </div>
}