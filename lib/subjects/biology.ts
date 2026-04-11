import { Stethoscope } from "lucide-react";
import { SubjectConfig } from "./subjectConfigSchema";
import { scienceInstructions } from "./scienceInstructions";

export const biologyConfig: SubjectConfig = {
    name: 'Biology',
    icon: Stethoscope,
    iconName: 'stethoscope',
    instructions: {
        notebook: `
        ${scienceInstructions.notebook}
        - Afterwards, explain each topic using this framework:
            - Explain what the topic is about based on information from sources.
            - Always use point form to break down explanations into concise and digestible pieces of information.
            - Processes: If a topic is about a process:
                - Include an online image of the process using the Image Query format.
                - Then, break down the process into clear, step-by-step instructions of how the process takes shape.
                - Include any relevant equations or conditions that must be met at each step.
            - Diagrams: If a topic includes diagrams, such as how a optical fibre works or the electromagnetic spectrum:
                - Include an online image of the diagram using the Image Query format.
                - Then, explain what each part of the diagram represents.
            - When applicable, include a "Common Misconceptions" (Use synonyms for each repetition) section: Add 2-4 pitfalls students often have for that topic.
        `,
        chat: scienceInstructions.chat,
        quiz: scienceInstructions.quiz
    }
}