'use client';
import { Button } from "@/components/ui/button";
export default function SettingsSidebar({pagesList, activePage, setActivePage}: {pagesList: any[], activePage: string, setActivePage: (page: any) => void}){
    return <div className="p-3 pr-0">
        <div className="bg-card h-full p-2 py-2 rounded-lg flex flex-col items-center gap-1 w-[11rem]">
            {pagesList.map((page) => (
                <Button key={page.id} variant="ghost" onClick={()=> setActivePage(page.id)} className={`justify-start w-full ${activePage  === page.id ? 'bg-sidebar-accent hover:bg-sidebar-accent!' : 'text-muted-foreground'} shrink-0`}>
                    <page.icon className="mr-1" />
                    {page.name}
                </Button>
            ))}
            <div className="flex-1"/>
        </div>
    </div>
}