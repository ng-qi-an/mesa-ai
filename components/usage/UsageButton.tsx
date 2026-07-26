import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { Button } from "../ui/button";
import { useUsage } from "../providers/usage-provider";
import { ChartNoAxesColumn } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function UsageButton(){
    const { getCurrentCreditUsage, creditUsagePercentage, billingCycle } = useUsage();
    return <div className="w-full flex items-center mb-4 justify-center">
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="w-7 rounded-full">
                    <CircularProgressbarWithChildren
                        value={creditUsagePercentage * 100}
                        styles={{
                        path: {
                            stroke: "var(--primary)",
                            strokeLinecap: "round",
                        },
                        trail: {
                            stroke: "var(--border)",
                        },
                        }}
                    >
                        <div className="text-center text-sm font-medium">
                            <ChartNoAxesColumn className="size-4 text-muted-foreground"/>
                        </div>
                    </CircularProgressbarWithChildren>
                </div>
            </TooltipTrigger>
            <TooltipContent className="w-48" side="right">
                <p className="text-sm">You have used {Math.floor(getCurrentCreditUsage())} out of {billingCycle.creditLimit} credits.</p>
            </TooltipContent>
        </Tooltip>
    </div>
}