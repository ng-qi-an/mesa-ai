import { Button } from "@/components/ui/button"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import { useEffect, useState } from "react"
import Banner from "@/components/banner"
import { ExternalLink } from "lucide-react"

export default function UserAbout(){
    const [version, setVersion] = useState("");
    useEffect(()=>{
        setVersion(window.localStorage.getItem("updateVersion") || "unknown");
    }, [])
    return <>
        <FieldSet className="w-full">
            <FieldGroup className="w-full gap-4">
                <div className="flex flex-col w-full">
                    <Banner className="w-[200px]"/>
                    <p className="text-base font-medium">Made with ❤️ by Qi An</p>
                    <p className="text-sm text-muted-foreground">Version: <b>v{version}</b></p>
                    <Button variant="link" className="w-max! p-0 mt-2" onClick={()=>window.open("https://github.com/ng-qi-an/mesa-ai", "_blank")}>
                        View on Github
                        <ExternalLink/>
                    </Button>
                </div>
            </FieldGroup>
        </FieldSet>
        <div className="flex-1"/>
    </>
}