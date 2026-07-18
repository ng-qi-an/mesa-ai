'use server';
import { generateText, Output } from "ai";
import { quizTextAnswerExplanation } from "./quizSchema";
import constructProvider from "@/lib/utils/constructProvider";
import { chatModels } from "@/lib/utils/models";

export default async function markTextAnswer({response, questionTitle, correctAnswer, longText, hint}: {response: string, questionTitle: string, correctAnswer: string, longText: boolean, hint: string}) {
    const { rawFinishReason, finishReason, output } = await generateText({
        model: constructProvider(chatModels[0]).chat(chatModels[0].name),
        output: Output.object({
            schema: quizTextAnswerExplanation,
        }),
        providerOptions: {
            thinkingConfig: {
                thinkingLevel: "minimal",
            }
        },
        instructions: `
        # Role
        You are a marker for student's text answers in a quiz.
        
        # Content guidelines
        - To aid in evaluating the student's answer, here is the hint provided to the student: ${hint}.
        - Additionally, here is the suggested answer to the question: ${correctAnswer}.        
        ${longText ? `
        - As the question is a long-answer question, the student's response should be a few sentences or a short paragraph.
        - The student's answer should fully acknowledge and synthesize all the points/concepts in the suggested answer, and not be a summarised one-liner of the suggested answer.
        - If the student's answer is missing any of the points/concepts in the correct answer, it should be marked as incorrect, even if it contains some correct information.
        - Points that were left out or incorrect should be clearly identified in the explanation to help the student understand their mistakes and learn the correct information.
        ` : `
        - As the question is a short-answer question, the student's response should be a brief, concise answer, typically a word, phrase, or one sentence.
        - The student's answer should more or less match the suggested answer to be marked as correct. It can be mispelled or have minor phrasing errors, but the core content should be correct.
        - If the student's answer is vague, ambiguous, or only partially correct compared to the suggested answer, it should be marked as incorrect.
        - The explanation should clearly identify what was wrong or missing in the student's answer compared to the correct answer to help the student understand their mistakes and learn the correct information.
        `}
        # Explanation guidelines
        - Format your answer as such: "Your answer is **correct** / **incorrect**.\\n [explanation bullet points]
        - Then, follow on with an explanation of why the student's answer is correct or incorrect. 
        - Always use markdown bullet points in the explanation to clearly separate different ideas and make it easier for the student to follow.
        - To use the bullet point format, start each point on a !!!!NEW LINE!!!!! with a "*" followed by a space, and then write the content of the point. Each point MUST be on a new line that is seperated with "\\n". For example:
        "- This is the first point of the explanation.\\n
        - This is the second point of the explanation.\\n
        - This is the third point of the explanation.\\n"
        - If the student's answer is correct, the explanation should briefly confirm that their answer is correct and highlight the key concept or reasoning that they demonstrated in their response.
        - If the student's answer is incorrect, the explanation should be detailed and clearly explain why the student's answer is wrong, and why the correct answer is right. The explanation should aim to help the student understand their mistake and learn the correct concept.
        - You can use markdown formatting to enhance the clarity of your explanation, such as bolding key terms or words such as "**incomplete**, **correct**, **incorrect**".
        `,
        prompt: "This is the question: " + questionTitle + "\nStudent's response:\n" + response,
    })
    if (finishReason == "stop"){
        console.log("Marking result:", output.explanation);
        return output; 
    } else {
        throw new Error(`Marking text failed: ${rawFinishReason}`);
    }

}