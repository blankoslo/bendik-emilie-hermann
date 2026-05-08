import { z } from "zod";
import { eq, desc, inArray } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { trips, tripCabins, tripGroupUsers } from "~/server/db/schema";
import { env } from "~/env.js";

const cabinInput = z.object({
  cabinId: z.string(),
  cabinName: z.string(),
  dayNumber: z.number().int().min(1),
});

export const tripsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        groupId: z.number().int(),
        name: z.string().min(1),
        routeId: z.string().optional(),
        routeName: z.string().optional(),
        routeLon: z.number().optional(),
        routeLat: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        createdById: z.string(),
        cabins: z.array(cabinInput).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const shareToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      const [trip] = await ctx.db
        .insert(trips)
        .values({
          groupId: input.groupId,
          name: input.name,
          routeId: input.routeId,
          routeName: input.routeName,
          routeLon: input.routeLon,
          routeLat: input.routeLat,
          startDate: input.startDate,
          endDate: input.endDate,
          shareToken,
          createdById: input.createdById,
        })
        .returning();

      if (input.cabins.length > 0) {
        await ctx.db.insert(tripCabins).values(
          input.cabins.map((c) => ({ ...c, tripId: trip!.id })),
        );
      }

      return trip;
    }),

  list: publicProcedure
    .input(z.object({ groupId: z.number().int() }))
    .query(({ ctx, input }) =>
      ctx.db.query.trips.findMany({
        where: eq(trips.groupId, input.groupId),
        with: { cabins: true },
        orderBy: [desc(trips.createdAt)],
      }),
    ),

  listByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userGroups = await ctx.db
        .select({ groupId: tripGroupUsers.groupId })
        .from(tripGroupUsers)
        .where(eq(tripGroupUsers.userId, input.userId));
      if (userGroups.length === 0) return [];
      const groupIds = userGroups.map((r) => r.groupId);
      return ctx.db.query.trips.findMany({
        where: inArray(trips.groupId, groupIds),
        with: { cabins: true, group: true },
        orderBy: [desc(trips.createdAt)],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(({ ctx, input }) =>
      ctx.db.query.trips.findFirst({
        where: eq(trips.id, input.id),
        with: { cabins: true, group: { with: { members: true } } },
      }),
    ),

  getByShareToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.query.trips.findFirst({
        where: eq(trips.shareToken, input.token),
        with: { cabins: true, group: { with: { members: true } } },
      }),
    ),

  generatePackingList: publicProcedure
    .input(z.object({ tripId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const trip = await ctx.db.query.trips.findFirst({
        where: eq(trips.id, input.tripId),
        with: { cabins: true, group: { with: { members: true } } },
      });

      if (!trip) throw new Error("Trip not found");

      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return "⚠️ ANTHROPIC_API_KEY ikke satt. Legg til nøkkelen i .env for å generere pakkeliste.";
      }

      const memberCount = trip.group?.members?.length ?? 1;
      const memberLevels = trip.group?.members
        ?.map((m) => `${m.name} (${m.experienceLevel ?? "ukjent nivå"})`)
        .join(", ") ?? "ukjent";

      const startDate = trip.startDate ?? "ukjent";
      const endDate = trip.endDate ?? "ukjent";
      const days = trip.startDate && trip.endDate
        ? Math.max(
            1,
            Math.round(
              (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                86400000,
            ) + 1,
          )
        : 1;

      const cabinList = trip.cabins
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map((c) => `Dag ${c.dayNumber}: ${c.cabinName}`)
        .join("\n");

      const prompt = `Du er en erfaren norsk friluftslivekspert. Generer en detaljert pakkeliste for denne turen:

Tur: ${trip.name}
Rute: ${trip.routeName ?? "ikke spesifisert"}
Dato: ${startDate} til ${endDate} (${days} dager)
Deltakere (${memberCount} stk): ${memberLevels}
Hyttestopp:
${cabinList || "Ingen hytter registrert"}

Lag en praktisk pakkeliste organisert i kategorier (klær, mat, utstyr, sikkerhet, etc.).
Tilpass listen til antall dager og deltakernes erfaringsnivå.
Skriv på norsk. Vær konkret og praktisk.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        throw new Error(`Anthropic API error: ${res.status}`);
      }

      const data = (await res.json()) as {
        content: { type: string; text: string }[];
      };
      return data.content[0]?.text ?? "Kunne ikke generere pakkeliste.";
    }),
});
