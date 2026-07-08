import { QuizResponseSelect, QuizSelect } from "@/lib/schemas/schema";
import { useEffect, useState } from "react";
import getQuizResponsesList from "@/lib/actions/quiz/getQuizResponsesList";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, History, ListTodo, Maximize2, Minimize2, PenLine, RotateCw, Star } from "lucide-react";
import QuizActionsDropdown from "@/components/quiz/QuizActionsDropdown";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import QuizNewResponsePanel from "./QuizNewResponsePanel";
import QuizResponseDetails from "@/components/quiz/QuizResponseDetails";
import { relativeTime } from "@/lib/utils/relativeTime";
import getNumberOfCorrectAnswers from "@/lib/actions/quiz/GetNumberOfCorrectAnswers";
import { Item, ItemMedia, ItemActions, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import createEmptyResponse from "@/lib/actions/quiz/createEmptyResponse";
import getQuiz from "@/lib/actions/quiz/getQuiz";
import { useTabs } from "@/components/providers/tabs-provider";
export default function QuizPanel({quizId}: {quizId: string}){
    const [quiz, setQuiz] = useState(null as QuizSelect | null);
    const [isAttempting, setIsAttempting] = useState(false);
    const [responses, setResponses] = useState<QuizResponseSelect[]>([]);
    const [selectedResponseId, setSelectedResponseId] = useState<string>("");
    const incompleteAttempt = responses.find(r => !r.completedQuiz);
    const [loading, setLoading] = useState(true);
    const { moveTab, getTabGroup, closeTab } = useTabs();
    const activeTabGroup = quiz ? getTabGroup(quiz.id) : undefined;
    
    useEffect(()=>{
        (async()=>{
            setLoading(true);
            try {
                const raw = await getQuiz(quizId);
                if (!raw){
                    toast.error("Quiz not found. It may have been deleted.");
                    return;
                }
                setQuiz(raw);
                const r = await getQuizResponsesList(raw.id);
                if (r.find((x)=> !x.completedQuiz)) {
                    console.log("Found an incomplete quiz response, loading attempting view", r.find((x)=> !x.completedQuiz));
                    setIsAttempting(true);
                }
                setResponses(r);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching quiz responses:", error);
                toast.error("Failed to load quiz responses. Please try again.")
            }
        })();
    }, [])
    return ((loading || !isAttempting) && quiz) ? 
    <div className={`bg-card h-full flex flex-col pb-3`}>
        <div className="flex items-center h-12 shrink-0 px-3 items-center border-b">
            <div className="flex w-full items-center gap-2">
                {selectedResponseId ? <Button variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0" onClick={()=> selectedResponseId && setSelectedResponseId("")}>
                    <ChevronLeft className="size-4"/>
                </Button> : <Button variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0 pointer-events-none">
                    <ListTodo className="size-4"/>
                </Button>}
                <p className="text-sm w-full">
                    {quiz.name}
                </p>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0" onClick={()=>{
                    if (!quiz) return;
                    moveTab(quiz.id!, activeTabGroup === "side" ? "main" : "side")
                }}>
                    {activeTabGroup == "side" ? <Maximize2 className="size-4"/> : <Minimize2 className="size-4"/>}
                </Button>
            </div>
            <QuizActionsDropdown triggerClassName="" quiz={quiz} onRename={(newName) => {
               setQuiz({...quiz, name: newName});
            }} onDelete={()=>{
                closeTab(quiz.id);
            }}/>
        </div>
        <div className="h-full w-full flex flex-col min-h-0">
            <Separator className="mb-2" />
            {loading ? <div className="h-full w-full flex flex-col justify-center items-center">
                <Spinner /> 
            </div>
            : selectedResponseId ? 
                <QuizResponseDetails response={responses.find(r => r.id === selectedResponseId)!} />
            : <div className="px-2 pb-2 pt-4">
                {incompleteAttempt ? <Item variant="outline">
                    <ItemMedia variant="icon">
                        <PenLine/>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Attempt in-progress</ItemTitle>
                        <ItemDescription>
                            Current score: {getNumberOfCorrectAnswers(incompleteAttempt)}/{quiz.questions.length}
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Button onClick={()=> {setIsAttempting(true)}} size="sm" variant="outline">
                            Continue
                            <ArrowRight/>
                        </Button>
                    </ItemActions>
                </Item>
                : <Item variant="muted">
                    <ItemMedia variant="icon">
                        <Star/>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>New attempt</ItemTitle>
                        <ItemDescription>
                            Attempt this quiz again to improve your score.
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Button onClick={async()=> {
                            setResponses(await createEmptyResponse(quiz.id, responses));
                            setIsAttempting(true);
                        }} size="sm" variant="outline">
                            Try again <RotateCw/>
                        </Button>
                    </ItemActions>
                </Item>}
                <p className="fomt-medium mt-3 text-muted-foreground mb-2 pl-2">Completed attempts</p>
                {responses.filter((r)=> r.completedQuiz).map((response, index) => <div onClick={()=> setSelectedResponseId(response.id)} key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-3 py-2 rounded-md w-full relative">
                    <ListTodo className="text-muted-foreground group-hover:text-foreground size-4"/>
                    <div className="flex flex-col pl-1">
                        <p className="truncate text-sm w-full font-medium">
                            Score: {getNumberOfCorrectAnswers(response)}/{response.respondedQuestions.length}
                        </p>
                        <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                            {relativeTime(response.dateModified, {capitalize: true})}
                        </p>
                    </div>
                </div>)}
            </div>
            }
        </div>
    </div>
    : (isAttempting && quiz) && <QuizNewResponsePanel quiz={quiz} setQuiz={setQuiz} response={incompleteAttempt!} responses={responses} setResponses={setResponses} setSelectedResponseId={setSelectedResponseId} setIsAttempting={setIsAttempting}/>;
}