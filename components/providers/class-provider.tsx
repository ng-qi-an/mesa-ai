'use client';

import { ClassSelect, TopicSelect } from "@/lib/schemas/schema";
import { useNextStep } from "nextstepjs";
import { createContext, useContext, useEffect, useState } from "react";

export type ClassContextType = {
    _class: ClassSelect & {topics: TopicSelect[]},
    setClass: (newClass: ClassSelect & {topics: TopicSelect[]}) => void,
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function useClass() {
    const context = useContext(ClassContext);
    if (!context) {
        throw new Error("useClass must be used within a ClassProvider");
    }
    return context;
}
export function ClassProvider({children, _class:initialClass}: {children: React.ReactNode, _class: ClassSelect & {topics: TopicSelect[]}}) {
    const [_class, setClass] = useState(initialClass);
    const {currentTour, setCurrentStep} = useNextStep();
    useEffect(()=>{
        if (currentTour == "onboarding"){
            setCurrentStep(3);
        }
    }, [])
    return <ClassContext.Provider value={{_class, setClass}}>
        {children}
     </ClassContext.Provider>
}

