import { relations } from "drizzle-orm";
import { account, session, user } from "./auth-schema";
import { classes, files, topicFiles, topics } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    classes: many(classes),
    topics: many(topics),
    files: many(files),
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
    files: many(topicFiles)
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
    topics: many(topicFiles)
}))

export const topicFilesRelations = relations(topicFiles, ({ one }) => ({
    topic: one(topics, {
        fields: [topicFiles.topicId],
        references: [topics.id],
    }),
    file: one(files, {
        fields: [topicFiles.fileId],
        references: [files.id],
    }),
}))