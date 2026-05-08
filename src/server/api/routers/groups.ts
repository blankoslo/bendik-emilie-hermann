import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { tripGroups, tripGroupMembers, tripGroupUsers } from "~/server/db/schema";

const experienceLevels = ["BEGINNER", "INTERMEDIATE", "EXPERIENCED", "EXPERT"] as const;

const memberInput = z.object({
  name: z.string().min(1),
  age: z.number().int().min(1).max(120).optional(),
  experienceLevel: z.enum(experienceLevels).optional(),
});

const createWithMembersInput = z.object({
  name: z.string().min(1),
  createdById: z.string(),
  members: z.array(memberInput),
});

export const groupsRouter = createTRPCRouter({
  createWithMembers: publicProcedure
    .input(createWithMembersInput)
    .mutation(async ({ ctx, input }) => {
      const [group] = await ctx.db
        .insert(tripGroups)
        .values({ name: input.name, createdById: input.createdById })
        .returning();
      await ctx.db.insert(tripGroupUsers).values({ groupId: group!.id, userId: input.createdById });
      if (input.members.length > 0) {
        await ctx.db.insert(tripGroupMembers).values(
          input.members.map((m) => ({ ...m, groupId: group!.id })),
        );
      }
      return group;
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), createdById: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [group] = await ctx.db
        .insert(tripGroups)
        .values({ name: input.name, createdById: input.createdById })
        .returning();
      await ctx.db.insert(tripGroupUsers).values({ groupId: group!.id, userId: input.createdById });
      return group;
    }),

  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({ groupId: tripGroupUsers.groupId })
        .from(tripGroupUsers)
        .where(eq(tripGroupUsers.userId, input.userId));
      if (rows.length === 0) return [];
      return ctx.db.query.tripGroups.findMany({
        where: inArray(tripGroups.id, rows.map((r) => r.groupId)),
        with: { members: true },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(({ ctx, input }) =>
      ctx.db.query.tripGroups.findFirst({
        where: eq(tripGroups.id, input.id),
        with: { members: true },
      }),
    ),

  updateGroup: publicProcedure
    .input(z.object({ id: z.number().int(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [group] = await ctx.db
        .update(tripGroups)
        .set({ name: input.name })
        .where(eq(tripGroups.id, input.id))
        .returning();
      return group;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(tripGroups).where(eq(tripGroups.id, input.id)),
    ),

  addMember: publicProcedure
    .input(memberInput.extend({ groupId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const [member] = await ctx.db
        .insert(tripGroupMembers)
        .values(input)
        .returning();
      return member;
    }),

  updateMember: publicProcedure
    .input(memberInput.partial().extend({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [member] = await ctx.db
        .update(tripGroupMembers)
        .set(data)
        .where(eq(tripGroupMembers.id, id))
        .returning();
      return member;
    }),

  removeMember: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(tripGroupMembers).where(eq(tripGroupMembers.id, input.id)),
    ),

  addUser: publicProcedure
    .input(z.object({ groupId: z.number().int(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(tripGroupUsers).values(input).onConflictDoNothing();
    }),

  removeUser: publicProcedure
    .input(z.object({ groupId: z.number().int(), userId: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .delete(tripGroupUsers)
        .where(
          eq(tripGroupUsers.groupId, input.groupId) &&
          eq(tripGroupUsers.userId, input.userId),
        ),
    ),
});
