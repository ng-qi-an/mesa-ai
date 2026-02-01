import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (process.env.PRIVILEGE_USERS?.split(",").includes(session?.user.email!)) {
        return children
    } else {
        return redirect('/dashboard')
    }
}