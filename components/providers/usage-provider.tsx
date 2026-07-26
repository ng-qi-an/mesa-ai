'use client';

import { BillingCycleSelect, ClassSelect, PlanSelect, TopicSelect, UsageEventSelect } from "@/lib/schemas/schema";
import { createContext, useContext, useEffect, useState } from "react";

export type UsageContextType = {
    billingCycle: BillingCycleSelect & {plan: PlanSelect, usageEvents: UsageEventSelect[]},
    plan: PlanSelect,
    usageEvents: UsageEventSelect[],
    getCurrentCreditUsage: () => number,
    creditUsagePercentage: number,
    setBillingCycle: (newBillingCycle: BillingCycleSelect & {plan: PlanSelect, usageEvents: UsageEventSelect[]}) => void,
    addUsageEvent: (event: UsageEventSelect) => void,
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export function useUsage() {
    const context = useContext(UsageContext);
    if (!context) {
        throw new Error("useUsage must be used within a UsageProvider");
    }
    return context;
}
export function UsageProvider({children, billingCycle, setBillingCycle}: {children: React.ReactNode, billingCycle: BillingCycleSelect & {plan: PlanSelect, usageEvents: UsageEventSelect[]}, setBillingCycle: (newBillingCycle: BillingCycleSelect & {plan: PlanSelect, usageEvents: UsageEventSelect[]}) => void}) {
    useEffect(()=>{
        console.log("[USAGE PROVIDER] Billing cycle updated:", billingCycle);
    }, [billingCycle])
    function getCurrentCreditUsage(){
        return billingCycle.usageEvents.reduce((total, event) => total + parseFloat(event.totalCredits), 0);
    }
    function addUsageEvent(event: UsageEventSelect){
        setBillingCycle({
            ...billingCycle,
            usageEvents: [...billingCycle.usageEvents, event],
        })
    }
    return <UsageContext.Provider value={{billingCycle: billingCycle, plan: billingCycle.plan, usageEvents: billingCycle.usageEvents, getCurrentCreditUsage, setBillingCycle, addUsageEvent, creditUsagePercentage: (getCurrentCreditUsage() / billingCycle.creditLimit)}}>
        {children}
     </UsageContext.Provider>
}

