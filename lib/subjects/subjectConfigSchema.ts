
export type SubjectConfig = {
    name: string;
    icon: any;
    iconName: string;
    instructions: SubjectInstructions;
}

export type SubjectInstructions = {
    notebook: string;
    chat: string;
    quiz: string;
}