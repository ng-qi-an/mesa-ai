import { Presentation } from "lucide-react";
import { SubjectConfig } from "./subjectConfigSchema";

export const genericConfig: SubjectConfig = {
    name: 'Generic',
    icon: Presentation,
    iconName: 'presentation',
    instructions: {
        notebook: ``,
        chat: ``,
        quiz: ``
    }
}