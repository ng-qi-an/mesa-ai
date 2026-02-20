import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MainSidebar from "./(components)/(sidebars)/MainSidebar";
import { redirect } from "next/navigation";
import getAllClassesServer from "@/lib/actions/classes/getAllClasses";
import { ClassProvider } from "@/components/providers/class-provider";
import getClassServer from "@/lib/actions/classes/getClass";

export default async function ClassLayout({children, params}: {children: React.ReactNode, params: Promise<{id: string}>}) {
    const resolvedParams = await params;
    const classes = await getAllClassesServer();
    const _class = await getClassServer(resolvedParams.id) //classes.find((_class) => _class.id === resolvedParams.id);

    if (!_class) {
        return redirect('/dashboard')
    }
    return (
        <ClassProvider _class={_class}>
            <SidebarProvider>
                <MainSidebar classes={classes} _class={_class} />
                <main className={_class.theme}>
                    <SidebarTrigger />
                    {children}
                </main>
            </SidebarProvider>
        </ClassProvider>
    )
}