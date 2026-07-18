'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizResponses, quizzes } from "@/lib/schemas/schema";
import { chatModels } from "@/lib/utils/models";
import { generateText, Output } from "ai";
import { generateId } from "better-auth";
import { headers } from "next/headers";
import { quizQuestionsSchema } from "./quizSchema";
import { availableSubjects } from "@/lib/subjects/subjectsList";
import constructProvider from "@/lib/utils/constructProvider";
import getNotebookFiles from "../notebook/getNotebookFiles";

export default async function createQuiz(classId: string, {noteId, fileIds, name, subject, topics, difficulty, questionTypes, length, instructions}: {noteId?: string, fileIds: string[], name: string, subject: keyof typeof availableSubjects, topics: string[], difficulty: string, questionTypes: string[], length: string, instructions: string}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        throw new Error("Not authenticated");
    }
    if (!fileIds || fileIds.length === 0) {
        throw new Error("At least one file ID is required");
    }
    if (!noteId){
        throw new Error("Notebook ID is required");
    }
    const files = await getNotebookFiles(noteId, true);
    console.log("Real files", files)
    console.log("Sent files:", files.filter((f)=> f.markdown != null).map(f => ({type: "file" as const, data: f.markdown, mediaType: "text/markdown", fileName: f.name})))

    const { rawFinishReason, finishReason, output } = await generateText({
        model: constructProvider(chatModels[0]).chat(chatModels[0].name),
        output: Output.object({ schema: quizQuestionsSchema }),
        toolChoice: "required",
        instructions: `
        # Subject-specific guidelines
        ${availableSubjects[subject].instructions.quiz}
        
        # Content guidelines
        - Generate questions only of the following types: ${questionTypes.join(", ")}. This setting takes highest prority, all other types MUST NOT be generated.
        - Use the files provided by the user to generate questions and answers. You may use your general knowledge to supplement answers, but it must be supported by the sources. 
        - Only make notes based on these topics: ${topics.join(", ")}.
        - Generate only ${length == "short" ? "7 questions for quick reviews" : length == "medium" ? "12 questions for a standard quiz" : "20 questions for comprehensive quizzes that test understanding of topics"}.
        
        # Question types
        ${questionTypes.includes("multiple-choice") ? `
        **Multiple choice questions (MCQs):**
        - Provide no more or less than *4 options* for each question, with only one correct answer.\n- The options should not be similar to each other at all.\n- Indicate which option is correct by setting the "answer" property nested in options to true.\n- Additionally, give a short explanation (in 1 sentence) as to why the option is correct or incorrect in the "explanation" property nested in options. This will be shown to the student after they answer the question to briefly reason their mistakes.\n" : ""}
        - Provide no more or less than *4 options* for each question, with only one correct answer.
        - The options should not be similar to each other at all.
        - Indicate which option is correct by setting the "answer" property nested in options to true.
        - Additionally, give a short explanation (in 1 sentence) as to why the option is correct or incorrect in the "explanation" property nested in options. This will be shown to the student after they answer the question to briefly reason their mistakes.
        ` : ""}
        ${questionTypes.includes("true-false") ? `
        **True-false questions:**
        - Require the student to determine whether a statement is true or false.
        - The statement should be concise and clearly true or false based on the content of the notes. It can be misleading or ambiguous depending on difficulty as described below. You should not mention "True or False" in the statement, just make a statement that can be evaluated as true or false.
        - Indicate the correct answer in the "trueFalseAnswer" property as a boolean.
        - Additionally, give a short explanation (in 1 sentence) as to why the option is correct or incorrect in the "explanation" property nested in options. This will be shown to the student after they answer the question to briefly reason their mistakes.
        ` : ""}
        ${questionTypes.includes("short-answer") ? `
        **Short answer questions:**
        - Require a brief, concise answer, typically a word, phrase, or one sentence.
        - The answer should be clear and specific.
        - Avoid open-ended questions that could have multiple valid answers. Those belong in long-answer questions.
        - Indicate the correct answer in the "textualAnswer" property.
        ` : ""}
        ${questionTypes.includes("long-answer") ? `
        **Long answer questions:**
        - Require a more detailed response, typically a few sentences or a short paragraph.
        - The answer should demonstrate a deeper understanding of the material and may involve critical thinking and synthesis of different concepts.
        - Indicate the correct answer in the "textualAnswer" property.
        ` : ""}
        # Difficulty
        **Easy questions:**
        - Easy to answer if the student understands the material, but not too complex.
        - Wrong options in MCQs should be clearly wrong, and answers should be less ambiguous.
        - Short and long answer questions should be more direct and require less synthesis and critical thinking, but favouring conciseness and memorization.
        **Hard questions:**
        - Require a deeper understanding of the material, critical thinking, and synthesis of different concepts.
        - Wrong options in MCQs can be more plausible and may require a deeper understanding of the material to distinguish from the correct answer.
        - Short and long answer questions can be more complex and may require critical thinking and synthesis of the material.
        **Medium questions:**
        - A moderate level of difficulty that requires a good understanding of the material.
        - Harder than easy questions but not as complex as hard questions. They can involve some critical thinking and synthesis, but not to the extent of hard questions.
        - Mix between Easy and Hard question styles.
        **Example of straightforward questions:**
        - What is the definition of X? (Short answer)
        - Which of the following is an example of Y? (MCQ)
        - Briefly describe the process of Z. (Long answer)
        **Example of complex questions:**
        - Which of the following scenarios best illustrates the application of concept Z? (MCQ) [In this case, provide answers that can be ambiguous and require a deep understanding of the material to distinguish the correct answer.]
        - List 3 key examples of concept X and concept Y. (Short answer)
        - Can you analyze the implications of theory A in the context of topic B? (Long answer)
        - Explain with an example of how concept X relates to concept Y. (Long answer)
        - Compare and contrast concept X and concept Y, providing examples of when each would be applicable. (Long answer)  
        
        **Since the quiz is meant to be ${difficulty} level, make sure to adjust the complexity of the questions and answers accordingly.**
        - Easier: More easy questions and MCQ questions. (Suggested: 30/70. Control at discretion)
        - Normal: A mix of easy and hard questions. (Suggested: 50/50. Control at discretion)
        - Hard: More hard and nuanced questions. (Suggested: 70/30. Control at discretion)
        `,
        prompt: [{role: "user", content: [
            ...files.filter((f)=> f.markdown).map(f => ({type: "file" as const, data: btoa(String.fromCharCode(...new TextEncoder().encode(f.markdown!))), mediaType: "text/markdown", fileName: f.name})),
            {type:"text", text: "# User's instructions\n" + instructions}]
        }],
    })
    if (finishReason == "stop"){
        const quiz =  await db.insert(quizzes).values({
            id: generateId(12),
            classId,
            notebookId: noteId || null,
            userId: session.user.id,
            name: name || output.name,
            topics,
            difficulty,
            questionTypes,
            length,
            questions: output.questions.map((q: any) => ({...q, id: generateId(12)})),
            instructions,
        }).returning()
        await db.insert(quizResponses).values({
            id: generateId(12),
            quizId: quiz[0].id,
            userId: session.user.id,
            respondedQuestions: [],
            completedQuiz: false,
        })   
        return quiz
    } else {
        throw new Error(`Quiz generation failed: ${rawFinishReason}`);
    }
}