import { MessageAction, MessageActions, MessageContent, MessageResponse, MessageToolbar } from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { generateId, TextUIPart, ToolUIPart } from "ai";
import ChatAttachments from "./ChatAttachments";
import { Source, Sources, SourcesContent, SourcesTrigger } from "../ai-elements/sources";
import { ChartNoAxesColumn, CopyIcon, File, FileSearch, FileText, Globe, RefreshCcwIcon, Scroll, SearchIcon, TextSearch, PencilSparkles, BookText, PenOff } from "lucide-react";
import { chatModels, ChatUIMessage } from "@/lib/utils/models";
import { ModelSelectorLogo } from "../ai-elements/model-selector";
import { Shimmer } from "../ai-elements/shimmer";
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "../ai-elements/task";
import { Spinner } from "../ui/spinner";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useUsage } from "../providers/usage-provider";
import { convertToCredits } from "@/lib/actions/billing/convertToCredits";

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
  const {plan} = useUsage();
  return <>
    {fileParts.length > 0 && <ChatAttachments files={fileParts.map((f)=> ({...f, id: generateId()}))}/>}
    <MessageContent className={cn("group", message.role== "assistant" && "w-full")}>
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
      <div className="flex flex-col gap-4">
        {reasoningParts.length > 0 && (
          <Reasoning className="w-full" isStreaming={isLastMessage && isStreaming && message.parts.at(-1)?.type === "reasoning"}>
            <ReasoningTrigger />
            <ReasoningContent>{reasoningParts.map((part) => part.text).join("\n\n")}</ReasoningContent>
          </Reasoning>
        )}
        {groupedParts.map((groupedPart, i)=>{
          if (groupedPart.type == "text"){
            return <div key={`${message.id}-${i}`} className="my-0"><MessageResponse >{(groupedPart as TextUIPart).text}</MessageResponse></div>;
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
                      {output ? <TaskItem className="flex flex-wrap items-start gap-2 mb-3"><FileText className="size-4 shrink-0 mt-1"/> <p className="">Retrieved {output.results.length} result{output.results.length !== 0 && "s"} from</p> {output.sourceFiles && output.sourceFiles.map((file)=> <TaskItemFile key={file.id} className="opacity-70"><File className="size-4"/> {file.name}</TaskItemFile>)}</TaskItem> : <></>}
                    </React.Fragment>
                  })}
                </TaskContent>
              </> : groupedPart.type == "tool-perplexity_search" ? <>
                <TaskTrigger title={lastPart.state ==  "output-available" ? "Searched the web" : "Searching the web..."} icon={lastPart.state== "output-available" ? <Globe className="size-4"/> : <Spinner className="size-4"/>} />
                <TaskContent>
                  {groupedPart.parts.map((part)=>{
                    const output = part.output as {results: {last_updated: string, title:string,  url: string}[]}
                    return <React.Fragment key={`${message.id}-${part.toolCallId}`}>
                      <TaskItem className="flex items-start gap-2"><SearchIcon className="size-4 shrink-0 mt-1"/> <p>Searching for "{part.input ? (part.input as { query: string }).query : ""}"</p></TaskItem>
                      {output ? <TaskItem className="flex items-start gap-2 mb-2"><TextSearch className="size-4 shrink-0 mt-1"/>
                          <Popover>
                            <PopoverTrigger asChild>
                              <span className="hover:text-foreground cursor-pointer transition-all">Retrieved {output.results.length} webpage{output.results.length !== 0 && "s"}</span>
                            </PopoverTrigger>
                            <PopoverContent align="start"sideOffset={10} className="w-68 flex flex-col gap-0 p-2">
                              {output.results.map((result, index)=>{
                                return <a href={result.url} key={`${result.title}+${result.url}+${part.toolCallId}+${index}`} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 py-2 px-2 cursor-pointer hover:bg-secondary rounded-lg">
                                  <p className="line-clamp-1 font-medium">{result.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{result.url}</p>
                                </a>
                              })}
                            </PopoverContent>
                          </Popover>
                        </TaskItem> : <></>}
                    </React.Fragment>
                  })}
                </TaskContent>
              </> : groupedPart.type == "tool-getDocumentState" ? <>
                <TaskTrigger title={lastPart.state ==  "output-available" ? `Read notebook` : "Reading notebook"} icon={lastPart.state== "output-available" ? <BookText className="size-4"/> : <Spinner className="size-4"/>} showChevron={false}/>
              </> : groupedPart.type == "tool-applyDocumentOperations" ? <>
                <TaskTrigger title={lastPart.state ==  "output-available" ? `Edited notebook` : lastPart.state == "output-error" ? "Failed to edit notebook" : "Editing notebook"} icon={lastPart.state == "output-available" ? <PencilSparkles className="size-4"/> : lastPart.state == "output-error" ? <PenOff className="size-4"/> :  <Spinner className="size-4"/>} showChevron={lastPart.state == "output-error"}/>
                {lastPart.state == "output-error" && <TaskContent>
                  <TaskItem className="flex items-start gap-2 mb-2">
                    An error occured while trying to edit the notebook. Try breaking down your query into multiple messages, or try a different approach.
                  </TaskItem>
                </TaskContent>}
                <div className="mb-2"></div>
              </>
              : <><p>Tool not recognised: {groupedPart.type}</p></>}
            </Task>
          }
        })}
      </div>
      {(message.role == "assistant" && message.metadata?.model) && <MessageToolbar className={`mt-0 ${isLastMessage ? "opacity-100" : "opacity-0"} ${message.metadata?.model && "group-hover:opacity-100"} transition-opacity`}>
      {modelObject && <p className="text-xs text-muted-foreground flex items-center gap-2 cursor-default"><ModelSelectorLogo provider={modelObject.name.split("/")[0]} /> {modelObject.label}</p>}
      <MessageActions>
        {modelObject &&<MessageAction
          tooltip={`Credits used: ~${Math.floor(convertToCredits({totalTokens: message.metadata?.totalTokens || 0, plan, modelName: modelObject.name}))} credits`}
          onClick={() => {}}
          label="Usage"
        >
          <ChartNoAxesColumn className="size-3" />
        </MessageAction>}
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