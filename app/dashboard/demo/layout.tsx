import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {ReactNode} from "react";
export default async function DemoLayout({children}: {children: ReactNode}){
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return <div className="flex flex-col w-full h-full">
        <div className="w-full flex items-center py-3 px-4 border-b bg-card">
            <h1 className="pl-2 font-medium">Mesa AI Demo</h1>
            <Link className="ml-auto"  href={"/dashboard"}>
                <Button size={'sm'} variant={"secondaryRaised"}>
                    Return to dashboard
                </Button>
            </Link>
        </div>
        {children}
    </div>
}