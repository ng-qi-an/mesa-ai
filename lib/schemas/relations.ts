import { relations } from "drizzle-orm";
import { account, session, user } from "./auth-schema";
import { classes, files, notebook, notebookFiles, topics } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    classes: many(classes),
    topics: many(topics),
    files: many(files),
    notebooks: many(notebook)
}));

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

export const classesRelations = relations(classes, ({ one, many }) => ({
    user: one(user, {
        fields: [classes.userId],
        references: [user.id],
    }),
    topics: many(topics),
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
    children: many(files),
    notebooks: many(notebookFiles)
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
    files: many(notebookFiles)
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