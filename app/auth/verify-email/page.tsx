'use client';
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailRequired(){
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const { data: session } = authClient.useSession()
    return session && <div className="h-screen w-full flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
            <CardHeader className="items-center flex flex-col">
                <img src="/email.png" style={{width: "200px", marginBottom: 20}}/>
                <CardTitle className="mt-4 text-lg">Verify Your Email</CardTitle>
                <CardDescription className="text-center">
                    Please check your email and follow the instructions to verify your account.
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col gap-2">
                <Button onClick={async()=>{
                    if (cooldown > 0) return;
                    setLoading(true)
                    try {
                        await authClient.sendVerificationEmail({
                            email: session.user.email || '',
                            callbackURL: `${window.location.origin}/dashboard`
                        })
                        setCooldown(60);
                        const x = setInterval(()=>{
                            setCooldown((prev)=>{
                                if (prev <= 1) {
                                    clearInterval(x);
                                    window.location.reload()
                                    return 0;
                                }
                                return prev - 1;
                            })
                        }, 1000)
                    } catch (error) {
                        console.error("Verification email error:", error);
                        alert("An unexpected error occurred when sending the verification email. Please try again.");
                    }
                    setLoading(false)
                }} 
                disabled={loading || cooldown > 0} 
                type="submit" 
                size={'lg'} 
                variant={"raised"} 
                className="w-full">
                    {loading ? <Spinner /> : cooldown > 0 ? `Resend again in ${cooldown}s` : "Resend Verification Email"}
                </Button>
            </CardFooter>
        </Card>
    </div>
}