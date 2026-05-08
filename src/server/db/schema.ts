import { index, pgEnum, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const createTable = pgTableCreator((name) => `friluftskompis_${name}`);

export const experienceLevelEnum = pgEnum("experience_level", [
  "BEGINNER",
  "INTERMEDIATE",
  "EXPERIENCED",
  "EXPERT",
]);

export const tripGroups = createTable(
  "trip_group",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    createdById: d.varchar({ length: 256 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("trip_group_created_by_idx").on(t.createdById)],
);

export const tripGroupMembers = createTable(
  "trip_group_member",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    groupId: d
      .integer()
      .notNull()
      .references(() => tripGroups.id, { onDelete: "cascade" }),
    userId: d.varchar({ length: 256 }),
    name: d.varchar({ length: 256 }).notNull(),
    age: d.integer(),
    experienceLevel: experienceLevelEnum(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("trip_group_member_group_idx").on(t.groupId),
    index("trip_group_member_user_idx").on(t.userId),
  ],
);

export const tripGroupUsers = createTable(
  "trip_group_user",
  (d) => ({
    groupId: d
      .integer()
      .notNull()
      .references(() => tripGroups.id, { onDelete: "cascade" }),
    userId: d.varchar({ length: 256 }).notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.groupId, t.userId] }),
    index("trip_group_user_user_idx").on(t.userId),
  ],
);

export const tripGroupsRelations = relations(tripGroups, ({ many }) => ({
  members: many(tripGroupMembers),
  users: many(tripGroupUsers),
}));

export const tripGroupMembersRelations = relations(tripGroupMembers, ({ one }) => ({
  group: one(tripGroups, {
    fields: [tripGroupMembers.groupId],
    references: [tripGroups.id],
  }),
}));

export const tripGroupUsersRelations = relations(tripGroupUsers, ({ one }) => ({
  group: one(tripGroups, {
    fields: [tripGroupUsers.groupId],
    references: [tripGroups.id],
  }),
}));

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);
