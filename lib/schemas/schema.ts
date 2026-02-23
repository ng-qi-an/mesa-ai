import { text, pgTable, serial, date, timestamp, AnyPgColumn } from "drizzle-orm/pg-core";
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

export const files = pgTable("files", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id").references(():AnyPgColumn => files.id, { onDelete: "cascade"}),
    name: text("name").notNull(),
    contentType: text("content_type").notNull(),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    dateModified: timestamp("date_modified").notNull().defaultNow(),
})

export type FileInsert = typeof files.$inferInsert
export type FileSelect = typeof files.$inferSelect

export const topicFiles = pgTable("topic_files", {
    id: serial("id").primaryKey(),
    topicId: text("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
    fileId: text("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
})

export type TopicFileInsert = typeof topicFiles.$inferInsert
export type TopicFileSelect = typeof topicFiles.$inferSelect