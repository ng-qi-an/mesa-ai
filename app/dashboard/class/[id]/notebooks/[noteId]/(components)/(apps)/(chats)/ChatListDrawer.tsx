import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import ChatActionsDropdown from "./ChatActionsDropdown";
import { useEffect, useState } from "react";
import { ChatSelect } from "@/lib/schemas/schema";
import getChatsList from "@/lib/actions/chat/getChatsList";
import { useNotebook } from "@/components/providers/notebook-provider";
import { MessageSquarePlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
export default function ChatListDrawer({show, setShow, onChange, onRename, onDelete}: {show: boolean, setShow: (show: boolean) => void, onChange?: (chatId: string | null) => void, onRename?: (chatId: string, newName: string) => void, onDelete?: (chatId: string) => void}){
    const [chatList, setChatList] = useState<ChatSelect[]>([]);
    const {noteId, mainChatId} = useNotebook();
    async function fetchChats(){
        setChatList(await getChatsList(noteId))
    }
    useEffect(()=>{
        if (show){
            fetchChats()
        }
    }, [show])
    return <AnimatePresence>
        {show && <>
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} key={"chatListBackdrop"} onClick={()=> setShow(false)} className={"absolute z-60 bg-black/50 w-full h-full top-0 left-0"}/>
        <motion.div initial={{x: -700}} animate={{x: 0}} exit={{x: -700}} transition={{type: "spring", bounce: 0.1, duration: 0.4 }} key={"chatList"} className={"max-w-72 w-full p-2 absolute top-0 left-0 z-70 h-full"}>
            <motion.div className={"h-full w-full bg-card border rounded-lg flex flex-col gap-2 p-4 overflow-auto"}>
                <div onClick={()=> {
                    onChange && onChange(null)
                    setShow(false)
                }} className={`w-full flex gap-3 group cursor-pointer rounded-lg items-center px-3 pr-1 py-1 h-10 shrink-0 ${!mainChatId ? "bg-secondary" : "hover:bg-secondary/50"}`}>
                    <MessageSquarePlus className="size-4"/>
                    <p className="text-sm truncate">New Chat</p>
                    <div onClick={(e)=> e.stopPropagation()} className="ml-auto opacity-0 group-hover:opacity-100">
                    </div>
                </div>
                <Separator className="my-1"/>
                {chatList.map((chat)=>{
                    return <div key={chat.id} onClick={()=>{
                        onChange && onChange(chat.id)
                        setShow(false)
                    }} className={`gap-2 w-full h-10 flex group cursor-pointer rounded-lg items-center px-3 pr-1 py-1 ${mainChatId === chat.id ? "bg-secondary" : "hover:bg-secondary/50"}`}>
                    <p className="text-sm truncate">{chat.name}</p>
                    <div className="flex-1"/>
                    <div onClick={(e)=> e.stopPropagation()} className="opacity-0 group-hover:opacity-100">
                        <ChatActionsDropdown chat={chat} onRename={(newName) => {
                            onRename && onRename(chat.id, newName);
                            fetchChats();
                        }} onDelete={async()=> {
                            onDelete && onDelete(chat.id);
                            fetchChats();
                        }}/>
                    </div>
                </div>})}
            </motion.div>
        </motion.div>
        </>}
    </AnimatePresence>
}