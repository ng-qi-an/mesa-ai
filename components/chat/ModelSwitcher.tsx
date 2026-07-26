import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorShortcut,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { chatModels, Model } from "@/lib/utils/models";
import { Button } from "../ui/button";
import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useUsage } from "../providers/usage-provider";

export default function ModelSwitcher({selectedModel, setSelectedModel}:{selectedModel: string, setSelectedModel: (model: string) => void}){
    const [open, setOpen] = useState(false);
    const selectedModelData = chatModels.find((model) => model.name === selectedModel);
    const modelsByProvider = chatModels.reduce((acc: { [key: string]: Model[]}, model) => {
        if (!acc[model.name.split("/")[0]]) {
            acc[model.name.split("/")[0]] = [];
        }
        acc[model.name.split("/")[0]].push(model);
        return acc;
    }, {});
    const { creditUsagePercentage } = useUsage();
    return <ModelSelector onOpenChange={setOpen} open={open}>
        <ModelSelectorTrigger asChild>
          <Button className="w-max" variant="ghost">
            {selectedModelData?.name.split("/")[0] && (
              <ModelSelectorLogo provider={selectedModelData.name.split("/")[0]} />
            )}
            {selectedModelData?.label && (
              <ModelSelectorName>{selectedModelData.label}</ModelSelectorName>
            )}
          </Button>
        </ModelSelectorTrigger>
        <ModelSelectorContent showCloseButton={false}>
          <ModelSelectorInput placeholder="Search models..." />
          <ModelSelectorList>
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
            {Object.values(modelsByProvider).map((models: Model[])=>{
              return <ModelSelectorGroup heading={models[0].name.split("/")[0].charAt(0).toUpperCase() + models[0].name.split("/")[0].slice(1)} key={"modelselector-"+models[0].name.split("/")[0]}>
                    {models.map((model) => (
                        <ModelSelectorItem disabled={creditUsagePercentage >= 1 && model.priceMultiplier != 0} key={model.name+model.provider} onSelect={() => {setSelectedModel(model.name); setOpen(false)}} value={model.name}>
                            <ModelSelectorLogo provider={model.name.split("/")[0]} />
                            <ModelSelectorName>{model.label}</ModelSelectorName>
                            {selectedModel === model.name ? (
                                <CheckIcon className="ml-auto size-4" />
                            ) : (
                                <div className="ml-auto size-4" />
                            )}
                              <Tooltip>
                                <TooltipTrigger>
                                  <ModelSelectorShortcut>
                                    {model.priceMultiplier !== undefined && model.priceMultiplier ? `${model.priceMultiplier}x` : "Free"}
                                  </ModelSelectorShortcut>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>Price Multiplier: {model.priceMultiplier !== undefined && model.priceMultiplier ? `${model.priceMultiplier}x` : "Free"}</p>
                                </TooltipContent>
                              </Tooltip>
                        </ModelSelectorItem>
                    ))}
                  </ModelSelectorGroup>
                })}
          </ModelSelectorList>
        </ModelSelectorContent>
    </ModelSelector>
}