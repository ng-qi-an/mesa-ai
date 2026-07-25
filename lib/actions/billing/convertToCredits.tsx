import { PlanSelect } from "@/lib/schemas/schema";
import { chatModels } from "@/lib/utils/models";

export function convertToCredits({totalTokens, modelName, plan}:{totalTokens:number, modelName:string, plan:PlanSelect}){
    let modelObject = chatModels.find((model) => model.name === modelName);
    if (!modelObject) {
        console.warn(`Model ${modelName} not found in chatModels. Using default model.`);
        modelObject = chatModels[0];
    }
    console.log("[Convert credits] Using model", modelObject.name, "with price multiplier", modelObject.priceMultiplier, "and plan base token credit multiplier", plan.baseTokenCreditMultiplier);
    return totalTokens * parseFloat(plan.baseTokenCreditMultiplier) * (modelObject.priceMultiplier === undefined ? 1 : modelObject.priceMultiplier);
}