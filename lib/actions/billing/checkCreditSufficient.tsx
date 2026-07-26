import { chatModels } from "@/lib/utils/models";
import getUserBillingCycle from "./getUserBillingCycle";
import { BillingCycleSelect, PlanSelect, UsageEventSelect } from "@/lib/schemas/schema";

export default async function checkCreditSufficient({userId, billingCycle:initialBillingCycle, modelName}:{userId?: string, billingCycle?: BillingCycleSelect & {plan: PlanSelect, usageEvents: UsageEventSelect[]}, modelName?: string}) {
    if (modelName && chatModels.find(model => model.name === modelName)?.priceMultiplier === 0) {
        return true;
    } 
    let billingCycle = initialBillingCycle;
    if (!billingCycle && !userId) {
        throw new Error("Either billingCycle or userId must be provided");
    }
    if (!billingCycle && userId) {
        billingCycle = await getUserBillingCycle(userId);
        if (!billingCycle) {
            throw new Error("Billing cycle not found");
        }
    }
    if (!billingCycle) {
        throw new Error("Billing cycle not found or provided");
    }
    const usedCredits = billingCycle.usageEvents.reduce((total, event) => total + parseFloat(event.totalCredits), 0);
    if (usedCredits >= billingCycle.creditLimit) {
        return false;
    } else {
        return true;
    }
}