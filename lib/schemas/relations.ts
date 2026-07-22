import { relations } from "drizzle-orm";
import { account, passkey, session, user } from "./auth-schema";
import { billingCycles, chatFiles, chats, classes, fileChunks, files, notebook, notebookFiles, plans, quizzes, topics, usageEvents, userMeta } from "./schema";

export const userRelations = relations(user, ({ many, one }) => ({
    sessions: many(session),
    accounts: many(account),
    classes: many(classes),
    topics: many(topics),
    files: many(files),
    notebooks: many(notebook),
    chats: many(chats),
    meta: one(userMeta),
    usageEvents: many(usageEvents),
}));

export const userMetaRelations = relations(userMeta, ({ one }) => ({
    user: one(user, {
        fields: [userMeta.userId],
        references: [user.id],
    }),
    plan: one(billingCycles, {
        fields: [userMeta.userId],
        references: [billingCycles.userId],
    }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));


export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));
    

export const classesRelations = relations(classes, ({ one, many }) => ({
    user: one(user, {
        fields: [classes.userId],
        references: [user.id],
    }),
    topics: many(topics),
    files: many(files),
    notebooks: many(notebook)
}))

export const topicsRelations = relations(topics, ({ one, many }) => ({
    user: one(user, {
        fields: [topics.userId],
        references: [user.id],
    }),
    class: one(classes, {
        fields: [topics.classId],
        references: [classes.id],
    }),
    notebooks: many(notebook)
}))

export const filesRelations = relations(files, ({ one, many }) => ({
    user: one(user, {
        fields: [files.userId],
        references: [user.id],
    }),
    parent: one(files, {
        fields: [files.parentId],
        references: [files.id],
    }),
    class: one(classes, {
        fields: [files.classId],
        references: [classes.id],
    }),
    notebooks: many(notebookFiles),
    chunks: many(fileChunks)
}))

export const fileChunksRelations = relations(fileChunks, ({ one }) => ({
    file: one(files, {
        fields: [fileChunks.fileId],
        references: [files.id],
    }),
}))

export const notebookRelations = relations(notebook, ({ one, many }) => ({
    user: one(user, {
        fields: [notebook.userId],
        references: [user.id],
    }),
    class: one(classes, {
        fields: [notebook.classId],
        references: [classes.id],
    }),
    topic: one(topics, {
        fields: [notebook.topicId],
        references: [topics.id],
    }),
    chats: many(chats),
    quizzes: many(quizzes),
    files: many(notebookFiles)
}))

export const chatsRelations = relations(chats, ({ one, many }) => ({
    user: one(user, {
        fields: [chats.userId],
        references: [user.id],
    }),
    notebook: one(notebook, {
        fields: [chats.notebookId],
        references: [notebook.id],
    }),
    chatFiles: many(chatFiles)
}))

export const chatFilesRelations = relations(chatFiles, ({ one }) => ({
    chat: one(chats, {
        fields: [chatFiles.chatId],
        references: [chats.id],
    }),
}))

export const notebookFilesRelations = relations(notebookFiles, ({ one }) => ({
    notebook: one(notebook, {
        fields: [notebookFiles.notebookId],
        references: [notebook.id],
    }),
    file: one(files, {
        fields: [notebookFiles.fileId],
        references: [files.id],
    }),
}))

export const quizzesRelations = relations(quizzes, ({ one }) => ({
    user: one(user, {
        fields: [quizzes.userId],
        references: [user.id],
    }),
    notebook: one(notebook, {
        fields: [quizzes.notebookId],
        references: [notebook.id],
    }),
}))

export const billingCyclesRelations = relations(billingCycles, ({ one, many }) => ({
    user: one(user, {
        fields: [billingCycles.userId],
        references: [user.id],
    }),
    usageEvents: many(usageEvents),
}))

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
    user: one(user, {
        fields: [usageEvents.userId],
        references: [user.id],
    }),
    billingCycle: one(billingCycles, {
        fields: [usageEvents.billingCycleId],
        references: [billingCycles.id],
    }),
}))

export const planRelations = relations(plans, ({ many }) => ({
    billingCycles: many(billingCycles),
    userMetas: many(userMeta),
}))