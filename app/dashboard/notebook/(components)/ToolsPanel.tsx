import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, FileText, ListTodo, MessageSquare, Mic, Minus, MoreVertical, WalletCards } from "lucide-react";

export default function ToolsPanel(){
    const tools = [
        {
            name: "Flashcards",
            icon: WalletCards
        }, 
        {
            name: "Podcast",
            icon: Mic
        },
        {
            name: "Quiz",
            icon: ListTodo
        },
        {
            name: "Chat",
            icon: MessageSquare
        }
    ]
    return <Card size="sm" className=" rounded-md h-full ring-neutral-900">
            <CardHeader className="items-center group flex cursor-pointer relative">
                <ChevronDown className="text-muted-foreground size-4 group-hover:text-foreground"/>
                <CardTitle className="ml-2 text-muted-foreground group-hover:text-foreground">
                    Tools
                </CardTitle>
            </CardHeader>
            <div className="h-max gap-3 flex flex-col px-3 items-center overflow-y-auto">
                <Separator className="mb-2" />
                <div className="grid grid-cols-2 gap-2 h-max w-full mb-2">
                    {tools.map((tool) => (
                        <div key={tool.name} className="w-full px-4 py-3 flex flex-col group cursor-pointer bg-secondary/50 hover:bg-secondary rounded-md gap-2">
                            <tool.icon className="size-5 text-muted-foreground group-hover:text-foreground"/>
                            <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{tool.name}</p>
                        </div>
                    ))}
                </div>
                {[...Array(10)].map((_, index) => (
                    <div key={index} className="cursor-pointer flex items-center gap-3 group hover:bg-secondary px-2 py-2 rounded-md w-full">
                        <ListTodo className="text-muted-foreground group-hover:text-foreground size-5.5"/>
                        <div className="flex flex-col">
                            <p className="truncate text-sm w-full font-medium">
                                Weather Quiz
                            </p>
                            <p className="truncate text-sm w-full text-muted-foreground group-hover:text-foreground/90">
                                Quiz - 1 minute ago
                            </p>
                        </div>
                        <Button size={'icon-sm'} className="text-muted-foreground ml-auto" variant={'ghost'}>
                            <MoreVertical/>
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
}