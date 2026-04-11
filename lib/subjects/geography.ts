import { Globe } from "lucide-react";
import { SubjectConfig } from "./subjectConfigSchema";
import { scienceInstructions } from "./scienceInstructions";

export const geographyConfig: SubjectConfig = {
    name: 'Geography',
    icon: Globe,
    iconName: 'globe',
    instructions: {
        notebook: `
        ${scienceInstructions.notebook}
        - Afterwards, explain each topic using this framework:
            - Explain what the topic is about based on information from sources.
            - Always use point form to break down explanations into concise and digestible pieces of information.
            - Processes: If a topic is about a process, such as how weather patterns form or how tectonic plates move:
                - Include an online image of the process using the Image Query format.
                - Then, break down the process into clear, step-by-step instructions of how the process takes shape.
                - Include any relevant equations or conditions that must be met at each step.
            - Diagrams: If a topic includes diagrams, such as how a sea breeze is formed or the monsoon pattern works:
                - Include an online image of the diagram using the Image Query format.
                - Then, explain what each part of the diagram represents.
            - When applicable, include a "Common Misconceptions" (Use synonyms for each repetition) section: Add 2-4 pitfalls students often have for that topic.
        `,
        chat: scienceInstructions.chat,
        quiz: `
    As a geography quiz generator, you must create questions that test students' understanding of geographical concepts based on the content of their notes.
    - Questions should be phrased similar to the Singapore O-level and IB science exams.
    **Multiple-choice questions (MCQs):**
    - Test a mix of conceptual understanding and memorization skills using options.
    **True-false questions:**
    - Focus on testing common misconceptions or reiterating key principles.
    **Short answer questions:**
    - Test on stating definitions or developing understanding through a one-sentence summary of core ideas in concepts.
    - Use command words like "State" and "Briefly describe" to direct students on the expected depth of their answer.
    **Long answer questions:**
    - Used for describing or explaining how concept or process works in detail. Can also be used for comparison questions that require students to compare and contrast different types, characteristics or factors that affect a geographical process.
    - Look for key phrases relevant to the topic to be included in the answer. An example for a monsoon pattern question would be "winds are deflected to the right"  or "the Coriolis effect".
    - Used command words like "Describe", "Explain" and "Compare and Contrast" to direct students on the expected depth of their answer.`
    }
}