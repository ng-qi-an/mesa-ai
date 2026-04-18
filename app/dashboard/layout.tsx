'use client';

import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "nextjs-toploader/app";
import { Suspense, useEffect } from "react";
export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const {data, isPending} = authClient.useSession();
    const router = useRouter();
    useEffect(()=>{
        if (!isPending && !data?.user) {
            router.push("/auth/log-in");
        }
    }, [data, isPending]);
    return <AnimatePresence mode="wait">
        {data ? 
        <motion.div key={'content'} className="w-full h-full" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
            {children}
        </motion.div> : 
        <motion.div key={'loading'} transition={{delay: 1}} className="w-full h-screen bg-background flex flex-col items-center justify-center" animate={{opacity: 1}} exit={{opacity: 0}}>
            <Logo type="theme" className="size-15 animate-pulse"/>
        </motion.div>}
    </AnimatePresence>
}