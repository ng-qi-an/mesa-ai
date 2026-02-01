import z from "zod";

export const quizSchema = z.object({
    question: z.string(),
    type: z.enum(["mcq", "oe"]).describe("The type of question: 'mcq' for multiple-choice or 'oe' for open-ended."),
    options: z.array(z.string()).describe("An array of possible answer options. Not required if the question is open-ended.").optional(),
    answer:  z.string().describe("The correct answer to the question."),
    hint: z.string().describe("A hint to help answer the question. Should not give away the answer directly."),
})