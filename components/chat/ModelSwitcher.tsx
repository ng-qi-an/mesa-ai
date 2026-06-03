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
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { chatModels, Model } from "@/lib/utils/models";
import { Button } from "../ui/button";
import { useState } from "react";
import { CheckIcon } from "lucide-react";

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
        <ModelSelectorContent>
          <ModelSelectorInput placeholder="Search models..." />
          <ModelSelectorList>
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
            {Object.values(modelsByProvider).map((models: Model[])=>{
              return <ModelSelectorGroup heading={models[0].name.split("/")[0].charAt(0).toUpperCase() + models[0].name.split("/")[0].slice(1)} key={"modelselector-"+models[0].name.split("/")[0]}>
                    {models.map((model) => (
                        <ModelSelectorItem key={model.name+model.provider} onSelect={() => {setSelectedModel(model.name); setOpen(false)}} value={model.name}>
                            <ModelSelectorLogo provider={model.name.split("/")[0]} />
                            <ModelSelectorName>{model.label}</ModelSelectorName>
                            {selectedModel === model.name ? (
                                <CheckIcon className="ml-auto size-4" />
                            ) : (
                                <div className="ml-auto size-4" />
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                                {model.priceMultiplier !== undefined && model.priceMultiplier ? `${model.priceMultiplier}x` : "Free"}
                            </p>
                        </ModelSelectorItem>
                    ))}
                  </ModelSelectorGroup>
                })}
          </ModelSelectorList>
        </ModelSelectorContent>
    </ModelSelector>
}