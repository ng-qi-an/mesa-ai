import { NotebookSelect } from "@/lib/schemas/schema";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MoreHorizontal, Notebook } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteNotebookDialog } from "./deleteNotebookDialog";
import { useState } from "react";

export default function NotebookListItem({notebook}: {notebook: NotebookSelect}){
    const router = useRouter();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    return <>
    <Card size="sm" onClick={()=> router.push(`/dashboard/class/${notebook.classId}/notebooks/${notebook.id}`)} className="relative w-full !pt-0 hover:bg-secondary/40 dark:hover:bg-secondary/30 dark:hover:shadow-none hover:shadow-sm hover:ring-primary/30 transition-all cursor-pointer h-max">
        <div
            className="z-20 aspect-4/2 sm:aspect-square bg-primary/30 w-full object-cover flex items-center justify-center"
        >
            <Notebook className="size-20 opacity-30"/>
        </div>
            <CardHeader className="px-3">
                    <CardTitle className="text-base flex w-full min-w-0 items-center relative pr-8">
                        <span className="truncate">{notebook.name}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={"ghost"} className="absolute z-20 -right-1" size={"icon-sm"}>
                                    <MoreHorizontal/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Open</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e)=> e.stopPropagation()}>Rename</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e)=> {e.stopPropagation(); setIsDeleteOpen(true)}} variant="destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Modified: {notebook.dateModified.toLocaleDateString()}</p>
            </CardHeader>
        </Card>
        <DeleteNotebookDialog noteId={notebook.id} open={isDeleteOpen} onOpenChange={setIsDeleteOpen}/>
    </>
}