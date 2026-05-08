import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { tripExpenses } from "~/server/db/schema";

export const expensesRouter = createTRPCRouter({
  add: publicProcedure
    .input(
      z.object({
        tripId: z.number().int(),
        description: z.string().min(1),
        amount: z.number().positive(),
        paidBy: z.string().min(1),
        splitAmong: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [expense] = await ctx.db
        .insert(tripExpenses)
        .values(input)
        .returning();
      return expense;
    }),

  list: publicProcedure
    .input(z.object({ tripId: z.number().int() }))
    .query(({ ctx, input }) =>
      ctx.db.query.tripExpenses.findMany({
        where: eq(tripExpenses.tripId, input.tripId),
        orderBy: (t, { asc }) => [asc(t.createdAt)],
      }),
    ),

  settlement: publicProcedure
    .input(z.object({ tripId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const expenses = await ctx.db.query.tripExpenses.findMany({
        where: eq(tripExpenses.tripId, input.tripId),
      });

      // net[person] = total paid - total owed
      const net: Record<string, number> = {};
      for (const e of expenses) {
        net[e.paidBy] = (net[e.paidBy] ?? 0) + e.amount;
        const share = e.amount / e.splitAmong.length;
        for (const name of e.splitAmong) {
          net[name] = (net[name] ?? 0) - share;
        }
      }

      // Greedy settlement: creditors pay debtors
      const creditors = Object.entries(net)
        .filter(([, v]) => v > 0.01)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);
      const debtors = Object.entries(net)
        .filter(([, v]) => v < -0.01)
        .map(([name, amount]) => ({ name, amount: -amount }))
        .sort((a, b) => b.amount - a.amount);

      const transfers: { from: string; to: string; amount: number }[] = [];
      let ci = 0;
      let di = 0;
      while (ci < creditors.length && di < debtors.length) {
        const c = creditors[ci]!;
        const d = debtors[di]!;
        const amount = Math.min(c.amount, d.amount);
        transfers.push({ from: d.name, to: c.name, amount: Math.round(amount) });
        c.amount -= amount;
        d.amount -= amount;
        if (c.amount < 0.01) ci++;
        if (d.amount < 0.01) di++;
      }

      return { net, transfers };
    }),
});
