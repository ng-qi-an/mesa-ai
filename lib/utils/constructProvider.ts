import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Model } from "./models";
import { createGateway } from '@ai-sdk/gateway';

export default function constructProvider(model: Model) {
    if (model.provider == "gateway"){
        return createGateway({
            apiKey: process.env.AI_GATEWAY_API_KEY!,
        });
    } else if (model.provider === "openrouter") {
        return createOpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY!,
        });
    } else {
        throw new Error(`Unsupported model provider: ${model.provider}`);
    }
}