'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useState } from "react";
import { createUser } from "./signupAction";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import socialSignIn from "../socialSignIn";

export default function SignUp(){
    // const [state, formAction, pending] = useActionState(createUser, {errors: null} as { errors: any[] | null });
    const [errors, setErrors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    return <div className="h-screen w-full flex flex-col items-center justify-center">
        <form className="w-full max-w-md" onSubmit={async(e)=>{
            setLoading(true)
            e.preventDefault()
            try {
                const result =await createUser(new FormData(e.currentTarget))
                if (result.status === 'success') {
                    router.replace('/auth/verify-email')
                    return
                } else if (result && result.errors) {
                    setErrors(result.errors)
                }
            } catch (error) {
                console.error("Sign up error:", error);
                alert("An unexpected error occurred when creating your account. Please try again.");
            }
            setLoading(false)
        }}>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Sign up to get started</CardTitle>
                    <CardDescription>
                        Enter your email below to sign up for a free account.
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
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    name="name"
                                    required
                                    disabled={loading}
                                />
                                {errors && errors.filter((x)=> x.path.includes("name")).map((y)=>{
                                    return <FieldError key={'nameError'}>{y.message}</FieldError>
                                })}
                                <FieldDescription>A nickname used across the platform.</FieldDescription>
                            </Field>
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
                <CardFooter className="flex-col gap-2">
                    <div className="flex flex-row w-full gap-2 mt-1">
                        <Button className="min-w-0 flex-1" type="button" variant={"secondary"} onClick={async()=> await socialSignIn("google")}>Sign up with Google</Button>
                    </div>
                    <Button disabled={loading} type="submit" size={'lg'} variant={"raised"} className="w-full">
                        {loading ? <Spinner /> : "Sign Up"}
                    </Button>
                    <Link href="/auth/log-in">
                        <Button variant={'link'} type="button">
                            Already have an account? Log in
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </form>
    </div>
}