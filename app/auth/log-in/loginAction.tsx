'use server'

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { z } from 'zod'
 
export async function loginUser(formData: FormData) {
    const userschema = z.object({
        email: z.email().nonoptional(),
        password: z.string().min(8).max(100).nonoptional(),
    })
    const validatedFields = userschema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!validatedFields.success) {
        return { status: 'error', errors: validatedFields.error!.issues };
    }
    try {
        const response = await auth.api.signInEmail({
            body: {
                email: validatedFields.data.email,
                password: validatedFields.data.password,
            }
        })
    } catch (error) {
        console.error("Error during log in:", error);
        if (error instanceof APIError) {
            if (error.message.toLowerCase().includes('invalid email or password')) {
                return { status: 'error', errors: [{ path: ['form'], message: 'Invalid email or password.' }] };
            }
        }
        return { status: 'error', errors: [{ path: ['form'], message: 'An unexpected error occurred. Please try again.' }] };
    }
    return {'status': 'success'};
}