import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export default function ChatInputWarning({onClose, className, variant="default", children}:{onClose: () => void, className?: string, variant?: "default" | "destructive", children: React.ReactNode}){
    return <div className={cn(`w-full h-full rounded-lg border ${variant=="default" ? "bg-neutral-900" : ""}  flex items-center px-3 py-2 gap-2`, className)}>
        {children}
        <X className="size-4 shrink-0 text-muted-foreground hover:text-foreground ml-auto cursor-pointer" onClick={onClose}/>
    </div>
}