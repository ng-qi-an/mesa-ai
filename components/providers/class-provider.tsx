'use client';

import { ClassSelect, TopicSelect } from "@/lib/schemas/schema";
import { createContext, useContext } from "react";

export type ClassContextType = {
    _class: ClassSelect & {topics: TopicSelect[]}
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function useClass() {
    const context = useContext(ClassContext);
    if (!context) {
        throw new Error("useClass must be used within a ClassProvider");
    }
    return context;
}
export function ClassProvider({children, _class}: {children: React.ReactNode, _class: ClassSelect & {topics: TopicSelect[]}}) {
    return <ClassContext.Provider value={{_class}}>
        {children}
     </ClassContext.Provider>
}

