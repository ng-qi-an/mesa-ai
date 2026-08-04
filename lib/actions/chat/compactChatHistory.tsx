import { ChatUIMessage } from "@/lib/utils/models";
import { repairBrokenNotebookToolCalls } from "./repairBrokenToolCalls";

export function compactChatHistory(messages: ChatUIMessage[]): ChatUIMessage[] {
    return repairBrokenNotebookToolCalls(messages.map((message) => {
      if (message.role !== "assistant") {
        return message;
      }
      return {
        ...message,
        parts: message.parts.filter((part) => {
            return ( part.type !== "tool-getDocumentState");
        }).map((part)=>{
            return (part.type == "tool-applyDocumentOperations" && part.state == "output-available") ? {...part, input: {operations: []}, output: {status: "success", summary: "Notebook changes were applied successfully."}} : part
        }),
      };
    }));
}