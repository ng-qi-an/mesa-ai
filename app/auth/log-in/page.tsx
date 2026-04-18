'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { loginUser } from "./loginAction";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import socialSignIn from "../socialSignIn";

export default function LogIn(){
    const [errors, setErrors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    return <div className="h-screen w-full flex flex-col items-center justify-center">
        <form className="w-full max-w-md" onSubmit={async(e)=>{
            setLoading(true)
            e.preventDefault()
            try {
                const result = await loginUser(new FormData(e.currentTarget))
                if (result.status === 'success') {
                    window.location.replace('/dashboard')
                    return
                } else if (result && result.errors) {
                    setErrors(result.errors)
                }
            } catch (error) {
                console.error("Log in error:", error);
                alert("An unexpected error occurred when logging in. Please try again.");
            }
            setLoading(false)
        }}>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {errors && errors.filter((x)=> x.path.includes("form")).map((y)=>{
                        return <Alert key={'formError'} variant="destructive" className="mb-4">
                            <AlertCircleIcon/>
                            <AlertTitle>Error on submission</AlertTitle>
                            <AlertDescription>{y.message}</AlertDescription>
                        </Alert>
                    })}
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    required
                                    disabled={loading}
                                />
                                {errors && errors.filter((x)=> x.path.includes("email")).map((y)=>{
                                    return <FieldError key={'emailError'}>{y.message}</FieldError>
                                })}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input id="password" name="password" type="password" required disabled={loading} />
                                {errors && errors.filter((x)=> x.path.includes("password")).map((y)=>{
                                    return <FieldError key={'passwordError'}>{y.message}</FieldError>
                                })}
                                <FieldDescription>Must be at least 8 characters.</FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="flex flex-row w-full gap-2 mt-1">
                        <Button className="min-w-0 flex-1" type="button" variant={"secondary"} onClick={async()=> await socialSignIn("google")}>Google</Button>
                        <Button className="min-w-0 flex-1" type="button" variant={"secondary"}>Passkey</Button>
                    </div>
                    <Button disabled={loading} type="submit" variant={"raised"} className="w-full">
                        {loading ? <Spinner /> : "Log In"}
                    </Button>
                    <Link href="/auth/sign-up">
                        <Button type="button" variant={'link'}>
                            Don't have an account? Sign up
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </form>
    </div>
}