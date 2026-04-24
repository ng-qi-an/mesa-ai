import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default async function passkeyLogin(autofill: boolean = false){
    try { 
        const {data, error} = await authClient.signIn.passkey({
            autoFill: autofill,
            fetchOptions: {
                onSuccess(context){
                    toast.success("Passkey login successful, redirecting...");
                    window.location.replace("/dashboard");
                },
                onError(context){
                    console.log("Passkey login failed:", context.error);
                    toast.error("Passkey login failed. Please try again.");
                }
            }
        });
        if (error){
            console.log("Error initiating passkey login:", error);
        }
    } catch (error) {
        console.log("Error initiating passkey login:", error);
    }
}