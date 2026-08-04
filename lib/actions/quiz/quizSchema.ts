import { quizQuestionTypes } from "@/lib/actions/quiz/quizQuestionTypes";
import z from "zod";

export const quizQuestionsSchema = z.object({
    name: z.string().describe("The name of the quiz. Should be extremely short, in 1-5 words."),
    questions: z.array(z.object({
        question: z.string(),
        type: z.enum(quizQuestionTypes.map(q => q.value)).describe("The format of the quiz question. Refer to instructions on which types are allowed."),
        difficulty: z.enum(["easy", "medium", "hard"]).describe("How difficult the question generated is compared to a rubric given."),
        textualAnswer: z.string().describe("The correct answer in textual form, used for evaluating **short-answer and long-answer questions**. For multiple-choice questions, this should be empty."),
        trueFalseAnswer: z.boolean().describe("The correct answer for **true-false** questions. For other question types, this should be empty."),
        options: z.array(z.object({
            value: z.string().describe("The text of the answer option. Must be unique and short among options for a given question."),
            answer: z.boolean().describe("Indicates whether this option is the correct answer. Only applicable for multiple-choice questions."),
            explanation: z.string().describe("A very brief 1-sentence explanation as to why the option is correct or incorrect.")
        })).describe("Only for **multiple-choice** questions. An array of strictly **4** answer options, including the correct answer. For other question types, this should be empty."),
        hint: z.string().describe("A hint to help the student answer the question, based on the content of the notes. Will also be used to mark textual answers.")
    }))
})

export type QuizQuestionsType = z.infer<typeof quizQuestionsSchema>;
export type QuizQuestionItemType = QuizQuestionsType["questions"][number] & {id: string};

export const quizTextAnswerExplanation = z.object({ 
    isCorrect: z.boolean().describe("Whether the student's answer is correct or not."),
    explanation: z.string().describe("A detailed explanation of why the student's answer is wrong, and why the suggested answer is correct."),
})

export type QuizTextAnswerExplanationType = z.infer<typeof quizTextAnswerExplanation>;