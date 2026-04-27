import { defineConfig } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

const drizzleEnv = process.env.NODE_ENV ?? "development";
const envFile = drizzleEnv === "production" ? ".env.production" : ".env.development";

loadEnv({ path: [envFile,  '.env'] });
if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL is missing. Checked ${envFile} and fallback .env`);
}

export default defineConfig({
  schema: "./lib/schemas/*.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
