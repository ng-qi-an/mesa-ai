import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Page(){
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (session) {
        return redirect('/dashboard')
    }
    return <div className="prose prose-neutral dark:prose-invert p-8">
        <h1>This is mesa ai</h1>
        <p>There isn't a landing page yet. This is just a parking page for now.</p>
        <a href="/auth/log-in">Log in</a>
        <br/>
        <a href="/auth/sign-up">Sign up</a>
    </div>
}