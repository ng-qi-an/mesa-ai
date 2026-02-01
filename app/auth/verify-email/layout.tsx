import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({children}: {children: React.ReactNode}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session){
        return redirect('/auth/log-in')
    } else if (session.user.emailVerified) {
        return redirect('/auth/verify-email')
    };
    return children;
}