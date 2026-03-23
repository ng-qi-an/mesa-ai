import { MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { generateId, UIMessage } from "ai";
import ChatAttachments from "./ChatAttachments";

export default function ChatMessageContent({message, isLastMessage, isStreaming}: {message: UIMessage, isLastMessage: boolean, isStreaming: boolean}){
  const reasoningParts = message.parts.filter((part) => part.type === "reasoning");
  const fileParts = message.parts.filter((part)=> part.type == "file");
  const textParts = message.parts.filter((part) => part.type === "text");
  return <>
    {fileParts.length > 0 && <ChatAttachments files={fileParts.map((f)=> ({...f, id: generateId()}))}/>}
    {(reasoningParts.length > 0 || textParts.length > 0) && <MessageContent>
        {reasoningParts.length > 0 && (
          <Reasoning className="w-full" isStreaming={isLastMessage && isStreaming && message.parts.at(-1)?.type === "reasoning"}>
            <ReasoningTrigger />
            <ReasoningContent>{reasoningParts.map((part) => part.text).join("\n\n")}</ReasoningContent>
          </Reasoning>
        )}
        {textParts.map((part, i) => {
            return (
              <MessageResponse key={`${message.id}-${i}`}>
                {part.text}
              </MessageResponse>
            );
        })}
      </MessageContent>
    }
  </>
};