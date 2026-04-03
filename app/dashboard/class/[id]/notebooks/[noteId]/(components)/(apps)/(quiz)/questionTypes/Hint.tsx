import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "@/components/ui/popover";

export default function Hint({hint, children , align}:{hint: string, children: React.ReactNode, align?: "start" | "center" | "end"}){
    return <Popover>
        <PopoverTrigger asChild>
            {children}
        </PopoverTrigger>
        <PopoverContent align={align || "start"}>
            <PopoverHeader>
                <PopoverTitle>Hint:</PopoverTitle>
                <PopoverDescription>{hint}</PopoverDescription>
            </PopoverHeader>
        </PopoverContent>
    </Popover>
}