import { QuizResponseSelect } from "@/lib/schemas/schema";

export default function getNumberOfCorrectAnswers(response: QuizResponseSelect) {
    return response.respondedQuestions.filter((rq)=>{
        console.log("Checking question", rq)
        if (rq.answerReasoning){
            return rq.answerReasoning.isCorrect;
        } else {
            if (rq.type == "multiple-choice"){
                if (rq.response == rq.options!.find(o => o.answer)?.value) {
                    return true;
                } else {
                    console.log("Incorrect answer for question", rq.question, "Expected", rq.options!.find(o => o.answer)?.value, "Got", rq.response);
                    return false;
                }
            } else if (rq.type == "true-false") {
                if (rq.trueFalseAnswer == (rq.response == "true" ? true : false)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                console.log("Unknown question type or missing answer reasoning for question", rq.type, rq.question);
            }
        }
    }).length;
}