import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MainSidebar from "./(components)/(sidebars)/MainSidebar";
import getClassServer from "@/lib/actions/classes/getClass";
import { redirect } from "next/navigation";
import getAllClassesServer from "@/lib/actions/classes/getAllClasses";

export default async function ClassLayout({children, params}: {children: React.ReactNode, params: Promise<{id: string}>}) {
    const resolvedParams = await params;
    const classes = await getAllClassesServer();
    const _class = classes.find((_class) => _class.id === resolvedParams.id);

    if (!_class) {
        return redirect('/dashboard')
    }
    return (
        <SidebarProvider>
            <MainSidebar classes={classes} _class={_class} />
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}