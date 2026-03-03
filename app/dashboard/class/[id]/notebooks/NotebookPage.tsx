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

export default function NotebookPage(){
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
                    toast.success("Notebook created successfully. Redirecting now...");
                } catch (error) {
                    console.error("Error creating notebook:", error);
                    toast.error("Failed to create notebook. Please try again.");
                } finally {
                    setCreating(false);
                }
            }}>Create new {creating ? <Spinner/> : <NotebookPen/>}</Button>
        </PageHeader>
    </>
}