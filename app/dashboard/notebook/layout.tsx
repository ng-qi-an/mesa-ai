import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Save, Settings, Share } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {ReactNode} from "react";
export default async function DemoLayout({children}: {children: ReactNode}){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return <div className="flex flex-col h-screen">
        <div className="w-full flex items-center py-4 px-6">
            <Link href={"/dashboard"}>
                <Logo type="favicon" className="size-7 invert hover:opacity-80"/>
            </Link>
            <h1 className="pl-4 font-medium">Mesa Notebook</h1>
            <div className="flex-1"/>
            <Button variant={"ghost"} size={'icon'}>
                <Settings/>
            </Button>
            <Button className="ml-2 mr-0">
                Share
                <Share/>
            </Button>
        </div>
        {children}
    </div>
}