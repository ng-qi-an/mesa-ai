import { text, pgTable, serial, timestamp, AnyPgColumn, jsonb, boolean, integer, vector, numeric } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { ChatUIMessage } from "../utils/models";
import { QuizQuestionItemType, QuizTextAnswerExplanationType } from "../actions/quiz/quizSchema";
import { availableSubjects } from "../subjects/subjectsList";

export const userMeta = pgTable("user_meta", {
    userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
    updateVersion: text("update_version").notNull().default("unknown"),
    onboarded: boolean("onboarded").notNull().default(false),
    planId: text("plan_id").default("default").references(() => plans.id, { onDelete: "set null" }),
})

export type UserMetaInsert = typeof userMeta.$inferInsert
export type UserMetaSelect = typeof userMeta.$inferSelect

export const classes = pgTable("classes", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    fileStoreId: text("file_store_id"),
    name: text("name").notNull(),
    subject: text("subject").notNull().$type<keyof typeof availableSubjects>(),
    theme: text("theme").notNull(),
    icon: text("icon").notNull(),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
});

export type ClassInsert = typeof classes.$inferInsert
export type ClassSelect = typeof classes.$inferSelect

export const topics = pgTable("topics", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
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
    summary: text("summary"),
    markdown: text("markdown"),
    status: text("status").notNull().default("uploaded"),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    dateModified: timestamp("date_modified").notNull().defaultNow(),
})

export type FileInsert = typeof files.$inferInsert
export type FileSelect = typeof files.$inferSelect

export const fileChunks = pgTable("file_chunks", {
    id: text("id").primaryKey(),
    fileId: text("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
})

export type FileChunkInsert = typeof fileChunks.$inferInsert
export type FileChunkSelect = typeof fileChunks.$inferSelect

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
    blocks: jsonb("blocks").$type<any[]>(),
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
    selectedModel: text("selected_model"),
    thinkingLevel: text("thinking_level"),
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

export const plans = pgTable("plans", {
    id: text("id").primaryKey().default("default"),
    name: text("name").notNull(),
    publicName: text("public_name").notNull(),
    description: text("description"),
    creditLimit: integer("credit_limit").notNull(),
    baseTokenCreditMultiplier: numeric("base_token_credit_multiplier").default("1").notNull(),
    status: text("status").notNull().default("active"),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    dateModified: timestamp("date_modified").notNull().defaultNow(),
})

export type PlanSelect = typeof plans.$inferSelect

export const billingCycles = pgTable("billing_cycles", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
    creditLimit: integer("credit_limit").notNull().default(0),
    dateStarted: timestamp("date_started").notNull().defaultNow(),
    dateEnded: timestamp("date_ended").notNull(),
    isActive: boolean("is_active").notNull().default(true),
})

export type BillingCycleSelect = typeof billingCycles.$inferSelect

export const usageEvents = pgTable("usage_events", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    eventSourceId: text("event_source_id"),
    eventData: jsonb("event_data").notNull().default({}),
    dateCreated: timestamp("date_created").notNull().defaultNow(),
    totalCredits: numeric("total_credits").notNull().default("0"),
    billingCycleId: text("billing_cycle_id").notNull().references(() => billingCycles.id, { onDelete: "cascade" }),
})

export type UsageEventSelect = typeof usageEvents.$inferSelect