import { index, pgEnum, pgTableCreator, primaryKey, real } from "drizzle-orm/pg-core";
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

export const trips = createTable(
  "trip",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    groupId: d.integer().notNull().references(() => tripGroups.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 256 }).notNull(),
    routeId: d.varchar({ length: 64 }),
    routeName: d.varchar({ length: 256 }),
    routeLon: real(),
    routeLat: real(),
    startDate: d.varchar({ length: 10 }),
    endDate: d.varchar({ length: 10 }),
    shareToken: d.varchar({ length: 64 }).unique(),
    createdById: d.varchar({ length: 256 }).notNull(),
    createdAt: d.timestamp({ withTimezone: true }).$defaultFn(() => new Date()).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("trip_group_idx").on(t.groupId),
    index("trip_share_token_idx").on(t.shareToken),
    index("trip_created_by_idx").on(t.createdById),
  ],
);

export const tripCabins = createTable(
  "trip_cabin",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    tripId: d.integer().notNull().references(() => trips.id, { onDelete: "cascade" }),
    cabinId: d.varchar({ length: 64 }).notNull(),
    cabinName: d.varchar({ length: 256 }).notNull(),
    dayNumber: d.integer().notNull().default(1),
    createdAt: d.timestamp({ withTimezone: true }).$defaultFn(() => new Date()).notNull(),
  }),
  (t) => [index("trip_cabin_trip_idx").on(t.tripId)],
);

export const tripGroupsRelations = relations(tripGroups, ({ many }) => ({
  members: many(tripGroupMembers),
  users: many(tripGroupUsers),
  trips: many(trips),
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

export const tripsRelations = relations(trips, ({ one, many }) => ({
  group: one(tripGroups, { fields: [trips.groupId], references: [tripGroups.id] }),
  cabins: many(tripCabins),
  expenses: many(tripExpenses),
}));

export const tripCabinsRelations = relations(tripCabins, ({ one }) => ({
  trip: one(trips, { fields: [tripCabins.tripId], references: [trips.id] }),
}));

export const tripExpenses = createTable(
  "trip_expense",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    tripId: d.integer().notNull().references(() => trips.id, { onDelete: "cascade" }),
    description: d.varchar({ length: 256 }).notNull(),
    amount: real().notNull(),
    paidBy: d.varchar({ length: 256 }).notNull(),
    splitAmong: d.json().$type<string[]>().notNull().default([]),
    createdAt: d.timestamp({ withTimezone: true }).$defaultFn(() => new Date()).notNull(),
  }),
  (t) => [index("trip_expense_trip_idx").on(t.tripId)],
);

export const tripExpensesRelations = relations(tripExpenses, ({ one }) => ({
  trip: one(trips, { fields: [tripExpenses.tripId], references: [trips.id] }),
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
