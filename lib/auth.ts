import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail } from "@/components/emails/emailActions";

export const auth = betterAuth({
    session: {
        disableSessionRefresh: true
    },
    emailAndPassword: { 
        enabled: true,
    }, 
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            sendVerificationEmail(user.email, url);
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    plugins: [nextCookies()] 
});