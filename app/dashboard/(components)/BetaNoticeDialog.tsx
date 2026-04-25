'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import updateUserMeta from "@/lib/actions/user/updateUserMeta";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function BetaNoticeDialog({showBeta, setShowBeta}: {showBeta: boolean, setShowBeta: (show: boolean) => void}){
    async function dismissBeta(){
        const newestVersion = "beta"
        await updateUserMeta({ updateVersion: newestVersion });
        window.localStorage.setItem("updateVersion", newestVersion);
        window.location.reload();
    }
    return <Dialog open={showBeta} onOpenChange={(open)=>{
        if (!open){
            return
        }
    }}>
        <DialogContent className={cn("h-max max-h-[90vh] sm:max-w-[500px] overflow-auto gap-4 p-0")}>
            <Image src="/MesaBetaBanner.png" alt="Mesa AI beta banner" className="w-full h-auto dark:invert" width={1200} height={520} priority />
            <div className="p-4 pt-0">
                <DialogTitle className="text-2xl font-semibold px-2 mt-2">A new beginning... 🚩</DialogTitle>
                <p className="pb-6 mt-4 px-2 text-muted-foreground text-sm/6 [&_b]:text-foreground/90 [&_b]:font-medium">
                    Mesa AI is now in <b>open beta</b>! Chats, Notebooks and Quizzes have been completed, with the rest coming <b>sometime this year</b>. 
                    <br/>
                    <br/>
                    In a <b>pre-release state</b>, expect <b>some bugs and minor performance issues</b> while we iron out the kinks. We recommend using Mesa AI on <b>desktop for the best experience</b> as mobile is still in development.
                    <br/>
                    <br/>
                    For the duration of this beta, <b>all AI features will remain free</b>. Create unlimited study kits and notes to prepare for your exams, <b>completely free of charge</b>. 
                </p>
                <DialogFooter>
                    <Button variant={"raised"} size={'lg'} onClick={async()=>{
                        dismissBeta();
                    }}>Lets go! <ArrowRight/></Button>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
}