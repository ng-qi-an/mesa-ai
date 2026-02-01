import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({children}: {children: React.ReactNode}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (session && session.user.emailVerified) {
        return redirect('/dashboard')
    };
    return children;
}