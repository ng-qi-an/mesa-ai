'use server';
import { Resend } from 'resend';
import VerifyEmail from '@/components/email/VerifyEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, url: string) {
    'use server';
    const { data, error } = await resend.emails.send({
      from: 'Mesa AI <mesa-onboarding@ngqian.dev>',
      to: [email],
      subject: 'Mesa AI - Verify your email address',
      react: VerifyEmail({ url: url }),
    });
    if (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send verification email');
    }
}