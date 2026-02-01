'use server'

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { redirect } from 'next/navigation';
import { z } from 'zod'
 
export async function createUser(formData: FormData) {
    const userschema = z.object({
        email: z.email().nonoptional(),
        name: z.string().min(2).max(100).nonoptional(),
        password: z.string().min(8).max(100).nonoptional(),
    })
    const validatedFields = userschema.safeParse({
        email: formData.get('email'),
        name: formData.get('name'),
        password: formData.get('password'),
    })
    if (!validatedFields.success) {
        return { status: 'error', errors: validatedFields.error!.issues };
    }
    try {
        const response = await auth.api.signUpEmail({
            body: {
                email: validatedFields.data.email,
                name: validatedFields.data.name,
                password: validatedFields.data.password,
            }
        })
    } catch (error) {
        console.error("Error during sign up:", error);
        if (error instanceof APIError) {
            if (error.message.includes('already exists')) {
                return { status: 'error', errors: [{ path: ['email'], message: 'An account with this email already exists.' }] };
            }
        }
        return { status: 'error', errors: [{ path: ['form'], message: 'An unexpected error occurred. Please try again.' }] };
    }
    return {'status': 'success'};
}