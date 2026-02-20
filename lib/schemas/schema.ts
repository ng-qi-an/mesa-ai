import { text, pgTable } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const classes = pgTable("classes", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    theme: text("theme").notNull(),
    icon: text("icon").notNull(),
});

export type ClassInsert = typeof classes.$inferInsert
export type ClassSelect = typeof classes.$inferSelect

export const topics = pgTable("topics", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
});

export type TopicInsert = typeof topics.$inferInsert
export type TopicSelect = typeof topics.$inferSelect