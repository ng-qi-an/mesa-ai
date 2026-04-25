import { Scroll, Settings, type LucideIcon } from "lucide-react";
import { ClassSelect, TopicSelect } from "@/lib/schemas/schema";
import updateClass from "@/lib/actions/classes/updateClass";
import ClassPrefGeneral from "./ClassPrefGeneral";
import ClassPrefInstructions from "./ClassPrefInstructions";

export type settingsPageType = {
    name: string,
    title: string,
    description: string,
    icon: LucideIcon,
    saveChanges?: (_class: ClassSelect & {topics: TopicSelect[]}, setClass: (updatedClass: ClassSelect & {topics: TopicSelect[]}) => void, changes: Record<string, any>) => Promise<void>,
    page?: React.ComponentType<any>
}

export const settingsPages: Record<string, settingsPageType> = {
    general: {
        name: "General",
        title: "General Settings",
        description: "Manage general class settings.",
        icon: Settings,
        page: ClassPrefGeneral,
        saveChanges: async(_class: ClassSelect & {topics: TopicSelect[]}, setClass: (updatedClass: ClassSelect & {topics: TopicSelect[]}) => void, changes: Record<string, any>) => {
            console.log("Saving changes for class", _class.id, changes);
            console.log(await updateClass(_class.id, changes));
            const updatedClass = {..._class, ...(await updateClass(_class.id, changes))[0]};
            console.log("Updated class after saving changes", updatedClass); 
            setClass(updatedClass);
        }
    },
    instructions: {
        name: "Instructions",
        title: "Configure default instructions",
        description: "Manage the default instructions for apps.",
        icon: Scroll,
        page: ClassPrefInstructions,
    },
};