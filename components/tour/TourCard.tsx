import { CardComponentProps, Step } from "nextstepjs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Streamdown } from "streamdown";

const TourCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) => {
  return (
    <Card className="w-[350px]">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                {step.icon && <span>{step.icon}</span>}
                {step.title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Streamdown linkSafety={{enabled: false}} mode="static" className="mb-2 text-sm/5 text-muted-foreground [&_b]:text-foreground [&_p]:mt-2 [&_a]:text-primary [&_a]:underline">
                {step.content as string}
            </Streamdown>
            {arrow}
        </CardContent>
        <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
                {currentStep + 1} / {totalSteps}
            </div>
            <div className="flex gap-2">
                {step.showControls && <>
                    {currentStep > 0 && step.selector && step.selector != "#classSidebar" && (
                    <Button variant="outline" size="sm" onClick={prevStep}>
                        Previous
                    </Button>
                    )}
                
                <Button size="sm" onClick={nextStep}>
                    {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                </Button>
                </>}
                {step.showSkip && (
                    <Button variant="ghost" size="sm" onClick={skipTour}>
                    Skip
                    </Button>
                )}
            </div>
        </CardFooter>
    </Card>
  );
};

export default TourCard;