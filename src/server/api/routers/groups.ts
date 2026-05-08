import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { tripGroups, tripGroupMembers } from "~/server/db/schema";

const experienceLevels = ["BEGINNER", "INTERMEDIATE", "EXPERIENCED", "EXPERT"] as const;

const memberInput = z.object({
  name: z.string().min(1),
  age: z.number().int().min(1).max(120).optional(),
  experienceLevel: z.enum(experienceLevels).optional(),
});

const createWithMembersInput = z.object({
  name: z.string().min(1),
  createdById: z.string(),
  creatorName: z.string().min(1),
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
      const memberRows = [
        { groupId: group!.id, userId: input.createdById, name: input.creatorName },
        ...input.members.map((m) => ({ ...m, groupId: group!.id })),
      ];
      await ctx.db.insert(tripGroupMembers).values(memberRows);
      return group;
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), createdById: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [group] = await ctx.db
        .insert(tripGroups)
        .values({ name: input.name, createdById: input.createdById })
        .returning();
      return group;
    }),

  list: publicProcedure
    .input(z.object({ createdById: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.query.tripGroups.findMany({
        where: eq(tripGroups.createdById, input.createdById),
        with: { members: true },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      }),
    ),

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
});
