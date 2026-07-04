import { MessageAction, MessageActions, MessageContent, MessageResponse, MessageToolbar } from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { generateId } from "ai";
import ChatAttachments from "./ChatAttachments";
import { Source, Sources, SourcesContent, SourcesTrigger } from "../ai-elements/sources";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { chatModels, ChatUIMessage } from "@/lib/utils/models";
import { ModelSelectorLogo } from "../ai-elements/model-selector";
import { Shimmer } from "../ai-elements/shimmer";

export default function ChatMessageContent({message, isLastMessage, isStreaming}: {message: ChatUIMessage, isLastMessage: boolean, isStreaming: boolean}){
  const reasoningParts = message.parts.filter((part) => part.type === "reasoning");
  const fileParts = message.parts.filter((part)=> part.type == "file");
  const textParts = message.parts.filter((part) => part.type === "text");
  const sourceParts = message.parts.filter(
    (part) => part.type === "source-url" || part.type === "source-document"
  );
  const isGrounded = message.role === "assistant" && sourceParts.length > 0;
  const modelObject = (message.metadata && message.metadata.model) ? chatModels.find((model) => model.name === message.metadata!.model) : null;
  return <>
    {fileParts.length > 0 && <ChatAttachments files={fileParts.map((f)=> ({...f, id: generateId()}))}/>}
    {(reasoningParts.length > 0 || textParts.length > 0) && <MessageContent className="group">
        
        {isGrounded && <Sources className="flex flex-wrap gap-2">
            <SourcesTrigger className="w-full hover:underline text-muted-foreground data-[state=open]:text-foreground cursor-pointer" count={sourceParts.length}/>
            {sourceParts.map((part, i) => {
                  return <SourcesContent className="text-muted-foreground my-0 bg-card hover:bg-secondary px-2.5 py-1.5 rounded-md" key={`${message.id}-${i}`}>
                    <Source
                      key={`${message.id}-${i}`}
                      href={part.type == "source-url" ? part.url : "#"}
                      title={part.title || (part.type == "source-url" ? part.url : "Document")}
                    />
                  </SourcesContent>
            })}
          </Sources>}
        {reasoningParts.length > 0 && (
          <Reasoning className="w-full" isStreaming={isLastMessage && isStreaming && message.parts.at(-1)?.type === "reasoning"}>
            <ReasoningTrigger />
            <ReasoningContent>{reasoningParts.map((part) => part.text).join("\n\n")}</ReasoningContent>
          </Reasoning>
        )}
        {message.parts.map(part => {
            switch (part.type) {
            case 'tool-searchDocuments':
                switch (part.state) {
                case 'input-streaming':
                    return <Shimmer key={part.toolCallId+part.state}>Searching...</Shimmer>;
                case 'input-available':
                    return <Shimmer key={part.toolCallId+part.state}>{`Searching for &quot;${(part.input as { query: string }).query}&quot;`}</Shimmer>;
                case 'output-available':
                    return <pre key={part.toolCallId+part.state}>Searched for &quot;{(part.input as { query: string }).query}&quot;</pre>;
                case 'output-error':
                    return <div key={part.toolCallId+part.state}>Error: {part.errorText}</div>;
                }
            case 'tool-listDocuments':
                switch (part.state) {
                case 'input-available':
                    return <pre key={part.toolCallId+part.state}>Retrieving document list...</pre>;
                case 'output-available':
                    return <pre key={part.toolCallId+part.state}>Retrieved document list</pre>;
                case 'output-error':
                    return <div key={part.toolCallId+part.state}>Error: {part.errorText}</div>;
                }
            }
        })}
        {textParts.map((part, i) => {
            return (
              <MessageResponse key={`${message.id}-${i}`}>
                {part.text}
              </MessageResponse>
            );
        })}
        {message.role == "assistant" && <MessageToolbar className={`mt-0 ${isLastMessage ? "opacity-100" : "opacity-0"} ${!isStreaming && "group-hover:opacity-100"} transition-opacity`}>
          {modelObject && <p className="text-xs text-muted-foreground flex items-center gap-2 cursor-default"><ModelSelectorLogo provider={modelObject.name.split("/")[0]} /> {modelObject.label}</p>}
        <MessageActions>
          <MessageAction
            tooltip="Retry message"
            onClick={() => {}}
            label="Retry"
          >
            <RefreshCcwIcon className="size-3" />
          </MessageAction>
          <MessageAction
            tooltip="Copy to Clipboard"
            onClick={() =>
              navigator.clipboard.writeText(textParts.map((part) => part.text).join("\n\n"))
            }
            label="Copy"
          >
            <CopyIcon className="size-3" />
          </MessageAction>
        </MessageActions>
        </MessageToolbar>}
      </MessageContent>
    }
  </>
};