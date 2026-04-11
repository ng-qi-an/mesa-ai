import { text, pgTable, serial, date, timestamp, AnyPgColumn, jsonb, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { UIMessage } from "ai";
import { ChatUIMessage } from "../utils/models";
import { QuizQuestionItemType, QuizTextAnswerExplanationType } from "../actions/quiz/quizSchema";
export const classes = pgTable("classes", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    fileStoreId: text("file_store_id"),
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
    classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contentType: text("content_type").notNull(),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    dateModified: timestamp("date_modified").notNull().defaultNow(),
})

export type FileInsert = typeof files.$inferInsert
export type FileSelect = typeof files.$inferSelect

export const notebook = pgTable("notebook", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
    topicId: text("topic_id").references(() => topics.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    title: text("title"),
    subtitle: text("subtitle"),
    topicWeights: jsonb("topic_weights").$type<{[key: string]: number}>(),
    length: text("length"),
    instructions: text("instructions"),
    sourceFiles: jsonb("source_files").$type<string[]>().default([]),
    fileStoreId: text("file_store_id"),
    content: text("content"),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    dateModified: timestamp("date_modified").notNull().defaultNow(),
})

export type NotebookInsert = typeof notebook.$inferInsert
export type NotebookSelect = typeof notebook.$inferSelect

export const notebookFiles = pgTable("notebook_files", {
    notebookFilesConnectorid: serial("notebook_files_connector_id").primaryKey(),
    notebookId: text("notebook_id").notNull().references(() => notebook.id, { onDelete: "cascade" }),
    fileId: text("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
})

export type NotebookFileInsert = typeof notebookFiles.$inferInsert
export type NotebookFileSelect = typeof notebookFiles.$inferSelect

export const chats = pgTable("chats", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
    notebookId: text("notebook_id").references(() => notebook.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("New chat"),
    messages: jsonb("messages").notNull().$type<ChatUIMessage[]>(),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    dateModified: timestamp("date_modified").notNull().defaultNow(),
})

export type ChatInsert = typeof chats.$inferInsert
export type ChatSelect = typeof chats.$inferSelect

export const chatFiles = pgTable("chat_files", {
    id: text("id").notNull(),
    contentType: text("content_type").notNull(),
    chatId: text("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
})

export type ChatFileInsert = typeof chatFiles.$inferInsert
export type ChatFileSelect = typeof chatFiles.$inferSelect

export const quizzes = pgTable("quizzes", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
    notebookId: text("notebook_id").references(() => notebook.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("New quiz"),
    topics: jsonb("topics_chosen").notNull().$type<string[]>(),
    difficulty: text("difficulty").notNull(),
    questionTypes: jsonb("question_types").notNull().$type<string[]>(),
    length: text("length").notNull(), 
    questions: jsonb("questions").notNull().$type<QuizQuestionItemType[]>(),
    instructions: text("instructions"),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    dateModified: timestamp("date_modified").notNull().defaultNow(),
})

export type QuizInsert = typeof quizzes.$inferInsert
export type QuizSelect = typeof quizzes.$inferSelect

export const quizResponses = pgTable("quiz_responses", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    quizId: text("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
    respondedQuestions: jsonb("responded_questions").notNull().$type<(QuizQuestionItemType & {response: string, answerReasoning?: QuizTextAnswerExplanationType})[]>().default([]),
    attemptingQuestionId: text("attemptingQuestionId"),
    completedQuiz: boolean("completed_quiz").notNull().default(false),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    dateModified: timestamp("date_modified").notNull().defaultNow(),
})

export type QuizResponseInsert = typeof quizResponses.$inferInsert
export type QuizResponseSelect = typeof quizResponses.$inferSelect