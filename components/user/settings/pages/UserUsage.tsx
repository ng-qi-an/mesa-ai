import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field"
import { User } from "better-auth"
import { useUsage } from "@/components/providers/usage-provider"
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Info, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function UserUsage({user, pageConfiguredChanges, setPageConfiguredChanges}:{user: User, pageConfiguredChanges: any, setPageConfiguredChanges: (changes: any) => void}){
    const { getCurrentCreditUsage, billingCycle, plan, usageEvents } = useUsage();

    return <>
        <FieldSet className="w-full gap-2">
            <FieldGroup className="w-full gap-2">
                <Field className="gap-2 bg-card p-4 py-4 rounded-lg">
                    <FieldTitle>
                        <p className="font-medium text-base"><span className="text-lg">{Math.floor(getCurrentCreditUsage())}</span> credits</p>
                        <p className="font-medium text-sm ml-auto text-muted-foreground">{billingCycle.creditLimit} credits</p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="ml-1"><Info className="w-4 h-4 text-muted-foreground"/></span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">The maximum credits in the this billing cycle. {plan.creditLimit != billingCycle.creditLimit && "Your limit may differ from your plan as changes take effect at the end of the billing cycle."}</TooltipContent>
                        </Tooltip>
                    </FieldTitle>
                    <Progress value={Math.min(getCurrentCreditUsage() / billingCycle.creditLimit * 100, 100)} className="w-full" />
                </Field>
            </FieldGroup>
            <FieldGroup className="w-full gap-2 flex grid sm:grid-cols-2 grid-cols-1">
                <Field className="gap-2 bg-card hover:bg-secondary/50 cursor-pointer p-4 rounded-lg">
                    <FieldTitle>Your plan <ChevronRight className="size-4 ml-auto text-muted-foreground"/></FieldTitle>
                    <FieldDescription className="text-sm text-muted-foreground">{plan.publicName}</FieldDescription>
                </Field>
                <Field className="gap-2 bg-card hover:bg-secondary/50 cursor-pointer p-4 rounded-lg">
                    <FieldTitle>Cycle period <ChevronRight className="size-4 ml-auto text-muted-foreground"/></FieldTitle>
                    <FieldDescription className="text-sm text-muted-foreground">{billingCycle.dateStarted.toLocaleDateString()} - {billingCycle.dateEnded.toLocaleDateString()}</FieldDescription>
                </Field>
            </FieldGroup>
            <FieldGroup className="w-full gap-4 mt-4">
                <Field className="gap-2 relative">
                    <FieldTitle>Recent usage</FieldTitle>
                    { usageEvents.length == 0 ? <Empty  className="absolute top-7 border border-dashed">
                        <EmptyHeader>
                            <EmptyMedia variant={"icon"}>
                                <TrendingUp/>
                            </EmptyMedia>
                            <EmptyTitle>Nothing yet</EmptyTitle>
                            <EmptyDescription>You haven't used any credits this cycle.</EmptyDescription>
                        </EmptyHeader>
                    </Empty> : <>
                        
                    </>}
                </Field>
            </FieldGroup>
        </FieldSet>
    </>
}