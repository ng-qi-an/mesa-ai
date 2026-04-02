'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ListPlus, ListTodo, MessageSquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotebook } from "@/components/providers/notebook-provider";
import { ChatSelect, QuizSelect } from "@/lib/schemas/schema";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import createChat from "@/lib/actions/chat/createChat";
import { relativeTime } from "@/lib/utils/relativeTime";
import { useParams } from "next/navigation";
import QuizActionsDropdown from "./QuizActionsDropdown";
import getQuizList from "./(actions)/getQuizList";
export default function QuizListPanel({setSidebarTool, quizList, setQuizList, setSelectedQuizId}: {setSidebarTool: (tool: string) => void, quizList: QuizSelect[], setQuizList: (quizzes: QuizSelect[]) => void, setSelectedQuizId: (id: string) => void}){
    const noteCtx = useNotebook();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    
    async function syncQuizList(){
        setLoading(true);
        try {
            setQuizList(await getQuizList(noteCtx.noteId))
        } catch {
            toast.error("Failed to load quizzes. Please refresh and try again.")
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        syncQuizList()
    }, [])

    return <Card size="sm" className={`rounded-md  ring-neutral-200 dark:ring-neutral-900 h-full`}>
        <CardHeader className="items-center group flex cursor-pointer relative">
            <div className="flex w-full items-center gap-1" onClick={()=> setSidebarTool("")}>
                <ChevronLeft className="text-muted-foreground group-hover:text-foreground size-4"/>
                <CardTitle 
                className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                    Quiz
                </CardTitle>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-block w-fit absolute right-4">
                        <Button disabled={noteCtx.files.length < 1 || loading || creating} size={'icon-sm'} className="text-muted-foreground" onClick={()=> setSelectedQuizId("create")} variant={'ghost'}>
                            <ListPlus/>
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">
                    {noteCtx.files.length > 0 ? <p>New quiz</p> : <p>Quizzes can't be created without sources.</p>}
                </TooltipContent>
            </Tooltip>
        </CardHeader>
        <div className="h-full">
            <Separator className="mb-2" />
            <div className="h-full px-2 pb-2 flex flex-col pt-2 gap-1 overflow-auto">
                {loading ? [...Array(5)].map((_, index) => (
                    <Skeleton className="h-12 my-0.5" key={index}/>
                )) : quizList.length > 0 ? quizList.map((quiz, index) => 
                    <div onClick={()=> setSelectedQuizId(quiz.id)} key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-3 py-2 rounded-md w-full relative">
                        <ListTodo className="text-muted-foreground group-hover:text-foreground size-4"/>
                        <div className="flex flex-col pl-1">
                            <p className="truncate text-sm w-full font-medium">
                                {quiz.name}
                            </p>
                            <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                                {relativeTime(quiz.dateModified, {capitalize: true})}
                            </p>
                        </div>
                        <QuizActionsDropdown triggerClassName="inline-block" quiz={quiz} onRename={()=> syncQuizList()} onDelete={()=> syncQuizList()}/>
                    </div>) : 
                    <Empty>
                        <EmptyHeader>
                            
                        <EmptyMedia variant={"icon"}>
                            <ListTodo/>
                        </EmptyMedia>
                            <EmptyTitle>Start a new quiz</EmptyTitle>
                            <EmptyDescription>Quizzes allow you to test your knowledge with sources.</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button onClick={()=> setSelectedQuizId("create")} disabled={noteCtx.files.length < 1} variant={"secondaryRaised"}>Create new <ListPlus/></Button>
                        </EmptyContent>
                    </Empty>}
            </div>
        </div>
    </Card>
}