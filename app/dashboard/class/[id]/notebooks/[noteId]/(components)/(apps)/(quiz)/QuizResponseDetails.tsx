import { QuizResponseSelect } from "@/lib/schemas/schema";
import getNumberOfCorrectAnswers from "./(actions)/GetNumberOfCorrectAnswers";

export default function QuizResponseDetails({response, setSelectedResponseId}:{response: QuizResponseSelect, setSelectedResponseId: (id: string) => void}){
    return <>
        <p>Number of correct answers: {getNumberOfCorrectAnswers(response)}/{response.respondedQuestions.length}</p>
    </>
}