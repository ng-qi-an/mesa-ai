import { relations } from "drizzle-orm";
import { account, session, user } from "./auth-schema";
import { classes } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    classes: many(classes),
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

export const classesRelations = relations(classes, ({ one }) => ({
    user: one(user, {
        fields: [classes.userId],
        references: [user.id],
    }),
}))