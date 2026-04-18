import { Button } from "@/components/ui/button";
import { Files, Shapes, Text } from "lucide-react";

export default function MobileTabbar({ selectedTab, setSelectedTab }: { selectedTab: string, setSelectedTab: (tab: string) => void }) {
    return <div className="flex justify-center p-8 px-4 pt-0">
        <div className="border rounded-lg p-2 px-4 flex items-center gap-2">
            <Button variant={selectedTab == "sources" ? "secondary" : "ghost"} className="flex-col p-0 size-10" onClick={() => setSelectedTab("sources")}>
                <Files/>
            </Button>
            <Button variant={selectedTab == "notebook" ? "secondary" : "ghost"} className="flex-col p-0 size-10" onClick={() => setSelectedTab("notebook")}>
                <Text/>
            </Button>
            <Button variant={selectedTab == "apps" ? "secondary" : "ghost"} className="flex-col p-0 size-10" onClick={() => setSelectedTab("apps")}>
                <Shapes/>
            </Button>
        </div>
    </div>
}