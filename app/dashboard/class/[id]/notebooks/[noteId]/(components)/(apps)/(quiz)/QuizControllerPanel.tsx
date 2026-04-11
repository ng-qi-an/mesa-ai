'use client';
import { useState } from "react";
import { QuizSelect } from "@/lib/schemas/schema";
import QuizListPanel from "./QuizListPanel";
import QuizCreatePanel from "./QuizCreatePanel";
import QuizPanel from "./QuizPanel";
export default function QuizControllerPanel({setSidebarTool}: {setSidebarTool: (tool: string) => void}){
    const [selectedQuizId, setSelectedQuizId] = useState("");
    const [quizList, setQuizList] = useState<QuizSelect[]>([]);
    const activeQuiz = (selectedQuizId && selectedQuizId !== "create") ? quizList.find((x)=> x.id == selectedQuizId) : undefined;

    if (selectedQuizId == "create") {
        return <QuizCreatePanel quizList={quizList} setQuizList={setQuizList} setSelectedQuizId={setSelectedQuizId}/>;
    } else if (activeQuiz){
        return <QuizPanel quiz={activeQuiz} setSelectedQuizId={setSelectedQuizId}/>;
    } else {
        return <QuizListPanel setSidebarTool={setSidebarTool} quizList={quizList} setQuizList={setQuizList} setSelectedQuizId={setSelectedQuizId}/>;
    }
}