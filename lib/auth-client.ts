import { sentinelClient } from "@better-auth/infra/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    // baseURL: "http://localhost:3000"
    plugins: [
        sentinelClient(),
        passkeyClient(),
        adminClient(),
    ]
})