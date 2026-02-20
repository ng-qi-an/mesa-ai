import { text, pgTable } from "drizzle-orm/pg-core";

export const classes = pgTable("classes", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    theme: text("theme").notNull(),
    icon: text("icon").notNull(),
});

export type ClassInsert = typeof classes.$inferInsert
export type ClassSelect = typeof classes.$inferSelect