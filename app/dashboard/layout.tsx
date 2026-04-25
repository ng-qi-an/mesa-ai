'use client';

import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { NextStep, NextStepProvider, useNextStep } from 'nextstepjs';
import { tours } from "@/lib/tours/tours";
import TourCard from "@/components/tour/TourCard";
import { useTheme } from "next-themes";
import updateUserMeta from "@/lib/actions/user/updateUserMeta";
import getUserMeta from "@/lib/actions/user/getUserMeta";
import BetaNoticeDialog from "./(components)/BetaNoticeDialog";
import { useIsMobile } from "@/hooks/use-mobile";
export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const {data, isPending} = authClient.useSession();
    const [showbeta, setShowBeta] = useState(false);
    const { resolvedTheme } = useTheme();
    const isMobile = useIsMobile();
    const router = useRouter();
    useEffect(()=>{
        if (!isPending && !data?.user) {
            router.push("/auth/log-in");
        }
    }, [data, isPending]);
    useEffect(()=>{
        if (data){
            (async()=>{
                const meta = await getUserMeta();
                const newestVersion = "beta";
                let currentVersion = window.localStorage.getItem("updateVersion");
                if (!currentVersion || currentVersion !== newestVersion) {
                    console.log("Outdated update version...")
                    currentVersion = meta.updateVersion;
                    if (currentVersion == newestVersion) {
                        window.localStorage.setItem("updateVersion", newestVersion);
                    } else {
                        console.log("User has not seen update notice, showing notice...")
                        return setShowBeta(true);
                    }
                }
                if (meta && !meta.onboarded && !window.location.search.includes("onboard=true") && !isMobile) {
                    router.push("/dashboard?onboard=true");
                }
            })();
        }
    }, [data])
    async function finishOnboarding(){
        await updateUserMeta({onboarded: true});
    }
    return <AnimatePresence mode="wait">
        <NextStepProvider>
            {data ? 
            <NextStep 
                steps={tours} 
                cardComponent={TourCard}
                shadowRgb={resolvedTheme == "dark" ? "0, 0, 0" : "0, 0, 0"}
                shadowOpacity={resolvedTheme == "dark" ? "0.8" : "0.2"}
                onComplete={()=> finishOnboarding()}
                onSkip={()=> {router.push("/dashboard"); finishOnboarding()}}
            >
                <BetaNoticeDialog showBeta={showbeta} setShowBeta={()=> setShowBeta(false)} />
                <motion.div key={'content'} className="w-full h-full" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                    {children}
                </motion.div>
            </NextStep> 
            : 
            <motion.div key={'loading'} transition={{delay: 1}} className="w-full h-screen bg-background flex flex-col items-center justify-center" animate={{opacity: 1}} exit={{opacity: 0}}>
                <Logo type="theme" className="size-15 animate-pulse"/>
            </motion.div>}
        </NextStepProvider>
    </AnimatePresence>
}