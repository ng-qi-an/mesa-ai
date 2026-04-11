import getAllClasses from "@/lib/actions/classes/getAllClasses";
import DashboardPage from "./client_page";

export default async function Page() {
    const classes = await getAllClasses();    
    return <DashboardPage classes={classes}/>
}