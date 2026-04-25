"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClassPrefSidebar from "./ClassPrefSidebar";
import { useState } from "react";
import { settingsPages } from "./pages/ClassPrefPageType";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import ClassPrefSelectMenu from "./ClassPrefSelectMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useClass } from "@/components/providers/class-provider";
import { Spinner } from "@/components/ui/spinner";

export default function ClassPrefDialog({open, onOpenChange}: {open: boolean, onOpenChange: (open: boolean) => void}){
    const [activePage, setActivePage] = useState<keyof typeof settingsPages>("general");
    const [configuredChanges, setConfiguredChanges] = useState<Record<keyof typeof settingsPages, Record<string, any>>>({});
    const [flashUnsaved, setFlashUnsaved] = useState(0);
    const [saving, setSaving] = useState(false);
    const isMobile = useIsMobile();
    const {_class, setClass} = useClass();

    const pagesList = Object.values(settingsPages).map((page, index)=> ({...page, id: Object.keys(settingsPages)[index]}));
    const ActivePageComponent = settingsPages[activePage].page || (()=><></>);

    return <Dialog open={open} onOpenChange={(open)=>{ 
        if (!open){
            if (Object.keys(configuredChanges).length > 0){
                setFlashUnsaved(1);
                setTimeout(() => {
                    setFlashUnsaved(2);
                }, 200);
                setTimeout(() => {
                    setFlashUnsaved(0);
                }, 400);
                return
            }
            setActivePage("general");
            setConfiguredChanges({});
        }
        onOpenChange(open)
    }}>
        <DialogContent className={`sm:max-w-3xl flex p-0 h-full max-h-[36rem] gap-0 overflow-hidden ${_class.theme}`} >
            {!isMobile && <ClassPrefSidebar pagesList={pagesList} activePage={activePage} setActivePage={setActivePage}/>}
            <div className="flex flex-col py-6 w-full relative">
                <DialogHeader className="mb-6 pl-6">
                    <DialogTitle className="font-medium">{settingsPages[activePage].title}</DialogTitle>
                    <DialogDescription>{settingsPages[activePage].description}</DialogDescription>
                    {isMobile && <ClassPrefSelectMenu pagesList={pagesList} activePage={activePage} setActivePage={setActivePage}/>}
                </DialogHeader>
                <div className="flex flex-col overflow-y-auto h-full w-full pb-20 px-6">
                    <ActivePageComponent _class={_class} pageConfiguredChanges={configuredChanges[activePage] || {}} setPageConfiguredChanges={(changes: Record<string, any>) => {
                        setConfiguredChanges((prev) => ({
                            ...prev,
                            [activePage]: changes
                        }));
                    }} />
                </div>
                <div className="flex-1"/>
                <AnimatePresence mode="wait">
                    {Object.keys(configuredChanges).length > 0 && (
                        <motion.div className="w-full absolute bottom-6 px-4" initial={{ y: 100 }} animate={{ opacity: 1, y: 0, scale: flashUnsaved == 1 ? 1.1 : 1 }} exit={{ opacity: 1, y: 100 }} key={"savechangespopup"}>
                            <div className={`w-full bg-card border flex items-center rounded-lg p-2 pl-3 gap-2 ring-2 ${flashUnsaved > 0 ? 'ring-destructive' : 'ring-transparent'} transition-all`}>
                                <h2 className="font-medium">You have unsaved changes!</h2>
                                <div className="flex-1"/>
                                <Button disabled={saving} variant={"ghost"} onClick={()=> setConfiguredChanges({})}>Reset</Button>
                                <Button disabled={saving} onClick={async()=> {
                                    setSaving(true);
                                    const x = await Promise.all(Object.values(configuredChanges).map(async(pageChanges, index) => {
                                        if (Object.keys(pageChanges).length > 0){
                                            const pageKey = Object.keys(configuredChanges)[index] as keyof typeof settingsPages;
                                            const pageConfig = settingsPages[pageKey];
                                            try {
                                                pageConfig.saveChanges && await pageConfig.saveChanges(_class, setClass, pageChanges);
                                            } catch (e){
                                                toast.error(`Failed to save changes for ${pageConfig.name}. Please try again.`);
                                                return false
                                            }
                                            return true
                                        }
                                    }))
                                    setConfiguredChanges({});
                                    setSaving(false);
                                }}>Save Changes {saving && <Spinner className="ml-2" />}</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DialogContent>
    </Dialog>
}