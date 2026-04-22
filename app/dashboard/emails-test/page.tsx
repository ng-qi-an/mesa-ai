'use client';
import { ComponentExample } from "@/components/component-example";
import { sendVerificationEmail } from "@/lib/actions/email/sendVerificationEmail";
import VerifyEmail from "@/components/email/VerifyEmail";
import { Button } from "@/components/ui/button";

export default function Page() {
    return <div>
        <VerifyEmail url="https://mesa-ai.com/verify-email?token=example-token" />
        <Button onClick={async()=>{
            const response = prompt("Enter email to send test verification email to:");
            if (!response) return;
            try {
                await sendVerificationEmail(response, `${window.location.href}/dashboard`)
                alert("Test verification email sent successfully.");
            } catch (e) {
                console.error("Error sending test email:", e);
                alert("Failed to send test email. See console for details.");
                return;
            }
        }}>Send test email</Button>
    </div>
}