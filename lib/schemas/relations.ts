import { relations } from "drizzle-orm";
import { account, passkey, session, user } from "./auth-schema";
import { chatFiles, chats, classes, files, notebook, notebookFiles, ragChunks, ragIndexJobs, topics, userMeta } from "./schema";

export const userRelations = relations(user, ({ many, one }) => ({
    sessions: many(session),
    accounts: many(account),
    classes: many(classes),
    topics: many(topics),
    files: many(files),
    notebooks: many(notebook),
    chats: many(chats),
    ragChunks: many(ragChunks),
    ragIndexJobs: many(ragIndexJobs),
    meta: one(userMeta)
}));

export const userMetaRelations = relations(userMeta, ({ one }) => ({
    user: one(user, {
        fields: [userMeta.userId],
        references: [user.id],
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
    notebooks: many(notebook),
    ragChunks: many(ragChunks),
    ragIndexJobs: many(ragIndexJobs),
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
    children: many(files),
    notebooks: many(notebookFiles),
    ragChunks: many(ragChunks),
    ragIndexJobs: many(ragIndexJobs),
}))

export const ragChunksRelations = relations(ragChunks, ({ one }) => ({
    user: one(user, {
        fields: [ragChunks.userId],
        references: [user.id],
    }),
    class: one(classes, {
        fields: [ragChunks.classId],
        references: [classes.id],
    }),
    file: one(files, {
        fields: [ragChunks.fileId],
        references: [files.id],
    }),
}))

export const ragIndexJobsRelations = relations(ragIndexJobs, ({ one }) => ({
    user: one(user, {
        fields: [ragIndexJobs.userId],
        references: [user.id],
    }),
    class: one(classes, {
        fields: [ragIndexJobs.classId],
        references: [classes.id],
    }),
    file: one(files, {
        fields: [ragIndexJobs.fileId],
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