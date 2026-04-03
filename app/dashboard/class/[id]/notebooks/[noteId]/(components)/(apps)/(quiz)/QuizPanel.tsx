import { QuizResponseSelect, QuizSelect } from "@/lib/schemas/schema";
import { useEffect, useState } from "react";
import getQuizResponsesList from "./(actions)/getQuizResponsesList";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ListTodo, PenLine, RotateCw, Star } from "lucide-react";
import QuizActionsDropdown from "./QuizActionsDropdown";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import QuizNewResponsePanel from "./QuizNewResponsePanel";
import QuizResponseDetails from "./QuizResponseDetails";
import { relativeTime } from "@/lib/utils/relativeTime";
import getNumberOfCorrectAnswers from "./(actions)/GetNumberOfCorrectAnswers";
import { Item, ItemMedia, ItemActions, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import createEmptyResponse from "./(actions)/createEmptyResponse";
export default function QuizPanel({quiz: importedQuiz, setSelectedQuizId}: {quiz: QuizSelect, setSelectedQuizId: (id: string) => void}){
    const [quiz, setQuiz] = useState(importedQuiz);
    const [isAttempting, setIsAttempting] = useState(false);
    const [responses, setResponses] = useState<QuizResponseSelect[]>([]);
    const [selectedResponseId, setSelectedResponseId] = useState<string>("");
    const incompleteAttempt = responses.find(r => !r.completedQuiz);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        (async()=>{
            setLoading(true);
            try {
                const r = await getQuizResponsesList(quiz.id);
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
    return (loading || !isAttempting) ? 
    <Card size="sm" className={`rounded-md ring-neutral-200 dark:ring-neutral-900 h-full pb-2!`}>
        <CardHeader className="items-center group flex cursor-pointer relative">
            <div className="flex w-full items-center gap-1" onClick={()=> selectedResponseId ? setSelectedResponseId("") : setSelectedQuizId("")}>
                <ChevronLeft onClick={()=> selectedResponseId ? setSelectedResponseId("") : setSelectedQuizId("")} className="text-muted-foreground group-hover:text-foreground size-4"/>
                <CardTitle
                className="ml-2 text-muted-foreground group-hover:text-foreground w-full">
                    {selectedResponseId ? "Response details" : quiz.name}
                </CardTitle>
            </div>
            <QuizActionsDropdown triggerClassName="inline-block w-fit absolute -top-1 right-4" quiz={quiz} onRename={(newName) => {
               setQuiz({...quiz, name: newName});
            }} onDelete={()=>{
                setSelectedQuizId("");
            }}/>
        </CardHeader>
        <div className="h-full w-full flex flex-col min-h-0">
            <Separator className="mb-2" />
            {loading ? <div className="h-full w-full flex flex-col justify-center items-center">
                <Spinner /> 
            </div>
            : selectedResponseId ? 
                <QuizResponseDetails response={responses.find(r => r.id === selectedResponseId)!} setSelectedResponseId={setSelectedResponseId} />
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
    </Card>
    : isAttempting && <QuizNewResponsePanel quiz={quiz} setQuiz={setQuiz} setSelectedQuizId={setSelectedQuizId} response={incompleteAttempt!} responses={responses} setResponses={setResponses} setSelectedResponseId={setSelectedResponseId} setIsAttempting={setIsAttempting}/>;
}