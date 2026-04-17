import { authClient } from "@/lib/auth-client";

export default async function socialSignIn(provider:string){
    await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
        errorCallbackURL: "/auth/error",
    });
}