'use client';
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AuthError(){
    const searchParams = useSearchParams();
    const error = searchParams.get("error") || "An authentication error occurred";
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <h2 className="text-lg mb-3 font-medium">An error occured</h2>
            <div className="w-full max-w-md">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
            <div className="flex mt-4 w-full max-w-md gap-2">
                <Button className="w-full" variant={"outline"} onClick={()=> window.location.replace('/auth/log-in')}>
                    Log in
                </Button>
                <Button className="w-full" variant={"outline"} onClick={()=> window.location.replace('/auth/sign-up')}>
                    Sign up
                </Button>
            </div>
        </div>
    );
}