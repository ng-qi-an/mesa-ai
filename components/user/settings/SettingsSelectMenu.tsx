'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function SettingsSelectMenu({pagesList, activePage, setActivePage}: {pagesList: any[], activePage: string, setActivePage: (page: any) => void}){
    return <div className="pr-6 mt-2">
        <Select value={activePage} onValueChange={(value)=> setActivePage(value)}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Selected page" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {pagesList.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                            <page.icon/>
                            {page.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
}