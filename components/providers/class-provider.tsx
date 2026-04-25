'use client';

import BetaNoticeDialog from "@/app/dashboard/class/[id]/(components)/BetaNoticeDialog";
import getUserUpdateVersion from "@/lib/actions/getUserUpdateVersion";
import { ClassSelect, TopicSelect } from "@/lib/schemas/schema";
import { createContext, useContext, useEffect, useState } from "react";

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
    const [showbeta, setShowBeta] = useState(false);
    useEffect(()=>{
        (async()=>{
            const newestVersion = "beta";
            let currentVersion = window.localStorage.getItem("updateVersion");
            if (!currentVersion || currentVersion !== newestVersion) {
                console.log("Outdated update version...")
                currentVersion = await getUserUpdateVersion(newestVersion)
                if (currentVersion == newestVersion) {
                    window.localStorage.setItem("updateVersion", newestVersion);
                } else {
                    console.log("User has not seen update notice, showing notice...")
                    setShowBeta(true);
                }
            }
        })();
    }, [])
    return <ClassContext.Provider value={{_class}}>
        <BetaNoticeDialog showBeta={showbeta} setShowBeta={()=> setShowBeta(false)} />
        {children}
     </ClassContext.Provider>
}

