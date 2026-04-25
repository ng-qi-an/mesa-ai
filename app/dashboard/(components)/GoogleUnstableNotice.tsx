'use client';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function GoogleUnstableNotice(){
    const [show, setShow] = useState(false);
    useEffect(()=>{
        if (!window.localStorage.getItem("googleUnstableNoticeDismissed")) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [])
    return show && <div className="w-full px-6 bg-destructive/10 border-b py-4 flex items-center">
        <p className="text-foreground/70 text-sm"><b className="text-foreground">Gemini API is unstable</b> - Chats, notebooks and quizzes may be degraded due to instability with the Gemini API.</p>
        <Button variant={'ghost'} className="ml-auto" onClick={()=>{
            window.localStorage.setItem("googleUnstableNoticeDismissed", "true");
            setShow(false);
        }} size={'icon-sm'}>
            <X/>
        </Button>
    </div>
}