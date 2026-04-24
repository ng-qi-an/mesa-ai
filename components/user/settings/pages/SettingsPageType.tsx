import { GraduationCap, Info, Lock, MessageSquare, Settings, type LucideIcon } from "lucide-react";
import UserGeneral from "./UserGeneral";
import { User } from "better-auth";
import { authClient } from "@/lib/auth-client";
import UserSecurity from "./UserSecurity";
import UserAbout from "./UserAbout";

export type settingsPageType = {
    name: string,
    title: string,
    description: string,
    icon: LucideIcon,
    saveChanges?: (user: User, changes: Record<string, any>) => Promise<void>,
    page?: React.ComponentType<any>
}

export const settingsPages: Record<string, settingsPageType> = {
    general: {
        name: "General",
        title: "General Settings",
        description: "Manage your profile details and preferences.",
        icon: Settings,
        page: UserGeneral,
        saveChanges: async(user: User, changes: Record<string, any>) => {
            console.log("Saving changes for user", user.id, changes);
            await authClient.updateUser({
                name: changes.name || user.name,
            })
        }
    },
    security : {
        name: "Security",
        title: "Security & Privacy",
        description: "Control your login options and privacy settings.",
        icon: Lock,
        page: UserSecurity,
    },
    chats: {
        name: "Chats",
        title: "Chat preferences",
        description: "Customize your chat experience and model selections.",
        icon: MessageSquare,
    },
    tutorials: {
        name: "Tutorials",
        title: "Tutorials & Guides",
        description: "Learn how to use Mesa AI with guides and support resources.",
        icon: GraduationCap,
    },
    about: {
        name: "About",
        title: "About Mesa AI",
        description: "Learn more about Mesa AI and its features.",
        icon: Info,
        page: UserAbout,
    }
};