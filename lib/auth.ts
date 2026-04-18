import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail } from "@/components/emails/emailActions";
import { dash } from "@better-auth/infra";

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:3000", "https://mesa-ai.vercel.app"],
    experimental: {
        joins: true, // Enable database joins for better performance
    },
    appName: "Mesa AI",
    ipAddressHeaders: ["x-vercel-forwarded-for", "x-forwarded-for"],
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
    socialProviders: { 
        google: { 
            prompt: "select_account", 
            clientId: process.env.GOOGLE_CLIENT_ID!, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!, 
        } 
    }, 
    plugins: [
        nextCookies(),
        dash()
    ] 
});