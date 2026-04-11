import { RulerDimensionLine } from "lucide-react";
import { SubjectConfig } from "./subjectConfigSchema";
import { scienceInstructions } from "./scienceInstructions";

export const physicsConfig: SubjectConfig = {
    name: 'Physics',
    icon: RulerDimensionLine,
    iconName: 'ruler-dimension-line',
    instructions: {
        notebook: `
        ${scienceInstructions.notebook}
        - Then, include a "Key Formulas" table that lists the main formulas, their variables, and when they apply.
        - Afterwards, explain each topic using this framework:
            - Explain what the topic is about based on information from sources.
            - Always use point form to break down explanations into concise and digestible pieces of information.
            - Diagrams: If a topic includes diagrams, such as how a optical fibre works or the electromagnetic spectrum:
                - Include an online image of the diagram using the Image Query format.
                - Then, explain what each part of the diagram represents.
            - When applicable, include a "Common Misconceptions" (Use synonyms for each repetition) section: Add 2-4 pitfalls students often have for that topic.
        `,
        chat: scienceInstructions.chat,
        quiz: scienceInstructions.quiz
    }
}