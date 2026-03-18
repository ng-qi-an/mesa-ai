'use client';
import { Input } from "@/components/ui/input";
import PageHeader from "../(components)/PageHeader";
import { Button } from "@/components/ui/button";
import { NotebookPen } from "lucide-react";
import { useState } from "react";
import { createNotebook } from "./(actions)/createNotebook";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { NotebookSelect } from "@/lib/schemas/schema";
import NotebookListItem from "./(components)/NotebookListItem";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function NotebookPage({notebooks}: {notebooks: NotebookSelect[]}){
    const [creating, setCreating] = useState(false);
    const {id} = useParams();
    if (!id || Array.isArray(id)) return <div>Class ID not found</div>
    const router = useRouter();
    return <>
        <PageHeader pages={[{name: "Notebooks"}]} actionsClassName="ml-0 w-full">
            <div className="flex-1"/>
            <Input className="w-full max-w-[300px] mr-1 border-0 px-3" placeholder="Search for notebooks"/>
            <Button disabled={creating} variant={"secondary"} className="mr-2" onClick={async()=>{
                setCreating(true);
                try {
                    const response = await createNotebook(id)
                    router.push(`/dashboard/class/${id}/notebooks/${response[0].id}`);
                } catch (error) {
                    console.error("Error creating notebook:", error);
                    toast.error("Failed to create notebook. Please try again.");
                } finally {
                    setCreating(false);
                }
            }}>Create new {creating ? <Spinner/> : <NotebookPen/>}</Button>
        </PageHeader>
        <div className="w-full h-full flex flex-col px-8 py-6">
            <h1 className="text-2xl font-semibold">Notebooks</h1>
            <p className="text-muted-foreground mt-1 mb-6">Consolidates learning materials and resources</p>
            {notebooks.length == 0 ?
            <Empty className="max-w-7xl border">
                <EmptyMedia variant={"icon"}>
                    <NotebookPen />
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle className="text-lg">No notebooks yet</EmptyTitle>
                    <EmptyDescription>Create notebooks to organize and consolidate learning materials for your class.</EmptyDescription>
                </EmptyHeader>
                
            </Empty>
            :
            <div className="w-full grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 max-w-7xl h-full overflow-auto p-4 rounded-lg content-start auto-rows-max">
                {notebooks.map((notebook)=>{
                    return <NotebookListItem key={notebook.id} notebook={notebook} />
                })}
            </div>
            }
        </div>
    </>
}