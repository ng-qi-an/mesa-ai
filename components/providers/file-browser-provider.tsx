'use client';

import { FileSelect } from "@/lib/schemas/schema";
import { createContext, useContext } from "react";

export type FileBrowserContextType = {
    nests: FileSelect[],
    setNests: (nests: FileSelect[]) => void,
    revalidateData: (...args: any[]) => Promise<void>,
    files: FileSelect[]
}

const FileBrowserContext = createContext<FileBrowserContextType | undefined>(undefined);

export function useFileBrowser() {
    const context = useContext(FileBrowserContext);
    if (!context) {
        throw new Error("useFileBrowser must be used within a FileBrowserProvider");
    }
    return context;
}
export function FileBrowserProvider({children, nests, setNests, revalidateData, files}: {children: React.ReactNode, nests: FileSelect[], setNests: (nests: FileSelect[]) => void, revalidateData: (...args: any[]) => Promise<void>, files: FileSelect[]}) {
    return <FileBrowserContext.Provider value={{nests, setNests, revalidateData, files}}>
        {children}
     </FileBrowserContext.Provider>
}

