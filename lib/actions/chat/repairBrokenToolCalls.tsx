import type { ChatUIMessage } from "@/lib/utils/models";

export function repairBrokenNotebookToolCalls(messages: ChatUIMessage[]) {
    console.log("Repairing broken notebook tool calls in messages:", messages);
    const repairedMessages = messages.map((message) => {
        if (message.role !== "assistant") {
            return message;
        }
        const parts = message.parts.map((part) => {
            if (part.type !== "tool-applyDocumentOperations") {
                return part;
            }
            if (part.state === "output-available" || part.state === "output-error") {
                return part;
            }
            console.log("Repairing a message")
            return ({
                type: "tool-applyDocumentOperations",
                toolCallId: part.toolCallId,
                input: {
                operations: [],
                },
                state: "output-error",
                errorText: "The previous notebook edit did not complete. Do not assume any previous document state or operation details. Call getDocumentState before attempting another edit.",
            } as unknown) as typeof part;
        });
        return {
            ...message,
            parts,
        };
    });
    console.log("Repaired messages:", repairedMessages);
    return repairedMessages
}