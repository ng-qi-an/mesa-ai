import { defineConfig } from "drizzle-kit";


export default defineConfig({
  schema: "./lib/schemas/*.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
