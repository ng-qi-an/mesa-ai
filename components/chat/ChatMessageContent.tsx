import { MessageAction, MessageActions, MessageContent, MessageResponse, MessageToolbar } from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { generateId, TextUIPart, ToolUIPart } from "ai";
import ChatAttachments from "./ChatAttachments";
import { Source, Sources, SourcesContent, SourcesTrigger } from "../ai-elements/sources";
import { CopyIcon, File, FileSearch, FileText, RefreshCcwIcon, Scroll, SearchIcon } from "lucide-react";
import { chatModels, ChatUIMessage } from "@/lib/utils/models";
import { ModelSelectorLogo } from "../ai-elements/model-selector";
import { Shimmer } from "../ai-elements/shimmer";
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "../ai-elements/task";
import { Spinner } from "../ui/spinner";
import React from "react";

export default function ChatMessageContent({message, isLastMessage, isStreaming}: {message: ChatUIMessage, isLastMessage: boolean, isStreaming: boolean}){
  const reasoningParts = message.parts.filter((part) => part.type === "reasoning");
  const fileParts = message.parts.filter((part)=> part.type == "file");
  const textParts = message.parts.filter((part) => part.type === "text");
  const sourceParts = message.parts.filter(
    (part) => part.type === "source-url" || part.type === "source-document"
  );
  const isGrounded = message.role === "assistant" && sourceParts.length > 0;
  const modelObject = (message.metadata && message.metadata.model) ? chatModels.find((model) => model.name === message.metadata!.model) : null;
  const groupedParts: (TextUIPart | {type: string, parts: ToolUIPart[]})[] = [];
  message.parts.map((part, index) => {
    if (part.type == "text"){
      groupedParts.push(part);
    } else if (part.type.startsWith("tool-")){
      if (groupedParts.at(-1)?.type == part.type) {
        (groupedParts.at(-1) as {type: string, parts: ToolUIPart[]}).parts.push(part as ToolUIPart);
      } else {
        groupedParts.push({type: part.type, parts: [part as ToolUIPart]});
      }
    }
  });
  return <>
    {fileParts.length > 0 && <ChatAttachments files={fileParts.map((f)=> ({...f, id: generateId()}))}/>}
    <MessageContent className="group">
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
      <div className="flex flex-col gap-4">
        {groupedParts.map((groupedPart, i)=>{
          if (groupedPart.type == "text"){
            return <MessageResponse key={`${message.id}-${i}`}>{(groupedPart as TextUIPart).text}</MessageResponse>;
          } else if (groupedPart.type.startsWith("tool-")){
            const lastPart = (groupedPart as {type: string, parts: ToolUIPart[]}).parts[(groupedPart as {type: string, parts: ToolUIPart[]}).parts.length - 1];
            return <Task key={`${message.id}-${i}`} defaultOpen={false}>
              {groupedPart.type == "tool-listDocuments" ? <>
                <TaskTrigger title={lastPart.state ==  "output-available" ? `Retrieved ${(lastPart.output as {files: any[]}).files.length} source${(lastPart.output as {files: any[]}).files.length !== 1 ? "s" : ""}` : "Retrieving sources..."} icon={lastPart.state== "output-available" ? <Scroll className="size-4"/> : <Spinner className="size-4"/>} showChevron={false}/>
              </>
              : groupedPart.type == "tool-searchDocuments" ? <>
                <TaskTrigger title={lastPart.state ==  "output-available" ? "Searched sources" : "Searching in sources..."} icon={lastPart.state== "output-available" ? <FileSearch className="size-4"/> : <Spinner className="size-4"/>} />
                <TaskContent>
                  {groupedPart.parts.map((part)=>{
                    const output = part.output as {results: {content: any, similarity: any, fileId: string}[], sourceFiles: {name: string, id: string}[]}
                    return <React.Fragment key={`${message.id}-${part.toolCallId}`}>
                      <TaskItem className="flex items-start gap-2"><SearchIcon className="size-4 shrink-0 mt-1"/> <p>Searching for "{part.input ? (part.input as { query: string }).query : ""}"</p></TaskItem>
                      {output ? <TaskItem className="flex items-start gap-2 mb-2"><FileText className="size-4 shrink-0 mt-1"/> <p className="flex flex-wrap items-center gap-2">Retrieved {output.results.length} result{output.results.length !== 0 && "s"} from {output.sourceFiles && output.sourceFiles.map((file)=> <TaskItemFile className="opacity-70"><File className="size-4"/> {file.name}</TaskItemFile>)} </p></TaskItem> : <></>}
                    </React.Fragment>
                  })}
                </TaskContent>
              </> : <><p>Tool not recognised: {groupedPart.type}</p></>}
            </Task>
          }
        })}
      </div>
      {message.role == "assistant" && !isStreaming && <MessageToolbar className={`mt-0 ${isLastMessage ? "opacity-100" : "opacity-0"} ${!isStreaming && "group-hover:opacity-100"} transition-opacity`}>
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
  </>
};