import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const UT_GRAPHQL =
  "https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql";

async function utQuery<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(UT_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://ut.no",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: `UT.no: ${res.status}` });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new TRPCError({ code: "BAD_GATEWAY", message: json.errors[0]!.message });
  }
  return json.data!;
}

export const SERVICE_LEVELS = [
  "STAFFED",
  "SELF_SERVICE",
  "NO_SERVICE",
  "NO_SERVICE_NO_BEDS",
  "FOOD_SERVICE",
  "EMERGENCY_SHELTER",
  "RENTAL",
] as const;

export type ServiceLevel = (typeof SERVICE_LEVELS)[number];

const serviceLevelFilter = z.array(z.enum(SERVICE_LEVELS)).optional();

const CABIN_FIELDS = `
  id
  name
  serviceLevel
  bedsStaffed
  bedsSelfService
  bedsNoService
  description
  geojson
`;

const CONNECTION_FIELDS = `
  totalCount
  pageInfo { hasNextPage endCursor }
  edges { cursor node { ${CABIN_FIELDS} } }
`;

const CABINS_QUERY = `
  query Cabins($first: Int!, $after: ConnectionCursor, $filter: CabinFilter!) {
    cabins(paging: { first: $first, after: $after }, filter: $filter, sorting: []) {
      ${CONNECTION_FIELDS}
    }
  }
`;

const CABIN_BY_ID = `
  query CabinById($id: Int!) {
    cabin(id: $id) { ${CABIN_FIELDS} }
  }
`;

const cabinsInput = z.object({
  first: z.number().int().min(1).max(50).default(20),
  after: z.string().optional(),
  serviceLevels: serviceLevelFilter,
});

function buildFilter(query?: string, serviceLevels?: ServiceLevel[]) {
  return {
    ...(query ? { name: { iLike: `%${query}%` } } : {}),
    ...(serviceLevels?.length ? { serviceLevel: { in: serviceLevels } } : {}),
  };
}

function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchElevation(lat: number, lon: number): Promise<number | null> {
  try {
    const url = `https://ws.geonorge.no/hoydedata/v1/punkt?nord=${lat}&ost=${lon}&koordsys=4258`;
    const res = await fetch(url, {
      headers: { "User-Agent": "friluftskompis/hackathon-2026" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { punkter?: Array<{ z?: number }> };
    return data.punkter?.[0]?.z ?? null;
  } catch {
    return null;
  }
}

function parseGeojsonCoords(geojson: unknown): [number, number] | null {
  try {
    const g = typeof geojson === "string" ? (JSON.parse(geojson) as unknown) : geojson;
    if (!g || typeof g !== "object") return null;
    const obj = g as { type?: string; coordinates?: number[]; geometry?: { type?: string; coordinates?: number[] } };
    if (obj.type === "Point" && Array.isArray(obj.coordinates)) {
      return [obj.coordinates[0]!, obj.coordinates[1]!];
    }
    if (obj.type === "Feature" && obj.geometry?.type === "Point" && Array.isArray(obj.geometry.coordinates)) {
      return [obj.geometry.coordinates[0]!, obj.geometry.coordinates[1]!];
    }
    return null;
  } catch {
    return null;
  }
}

function computeLeg(
  from: { id: string; name: string; lon: number; lat: number },
  to: { id: string; name: string; lon: number; lat: number },
  elevFrom: number | null,
  elevTo: number | null,
) {
  const distKm = haversineKm(from.lon, from.lat, to.lon, to.lat) * 1.3;
  const elevGainM = elevFrom != null && elevTo != null ? Math.max(0, elevTo - elevFrom) : null;
  const elevLossM = elevFrom != null && elevTo != null ? Math.max(0, elevFrom - elevTo) : null;
  const estimatedHours = distKm / 4 + (elevGainM != null ? elevGainM / 600 : 0);
  return {
    fromId: from.id,
    toId: to.id,
    fromName: from.name,
    toName: to.name,
    distKm: Math.round(distKm * 10) / 10,
    elevGainM: elevGainM != null ? Math.round(elevGainM) : null,
    elevLossM: elevLossM != null ? Math.round(elevLossM) : null,
    elevStartM: elevFrom != null ? Math.round(elevFrom) : null,
    elevEndM: elevTo != null ? Math.round(elevTo) : null,
    estimatedHours: Math.round(estimatedHours * 10) / 10,
    demanding: elevGainM != null && elevGainM > 1000,
  };
}

export const cabinsRouter = createTRPCRouter({
  list: publicProcedure
    .input(cabinsInput)
    .query(({ input }) =>
      utQuery(CABINS_QUERY, {
        first: input.first,
        after: input.after,
        filter: buildFilter(undefined, input.serviceLevels),
      }),
    ),

  search: publicProcedure
    .input(cabinsInput.extend({ query: z.string().min(1) }))
    .query(({ input }) =>
      utQuery(CABINS_QUERY, {
        first: input.first,
        after: input.after,
        filter: buildFilter(input.query, input.serviceLevels),
      }),
    ),

  byId: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(({ input }) => utQuery(CABIN_BY_ID, { id: input.id })),

  near: publicProcedure
    .input(z.object({ lon: z.number(), lat: z.number(), maxDistance: z.number().default(50000) }))
    .query(({ input }) =>
      utQuery(
        `query CabinsNear($input: FindNearInput!) {
          cabinsNear(input: $input) {
            distance
            cabin { ${CABIN_FIELDS} }
          }
        }`,
        { input: { coordinates: [input.lon, input.lat], maxDistance: input.maxDistance } },
      )
    ),

  legStats: publicProcedure
    .input(
      z.array(z.object({ id: z.string(), name: z.string(), lon: z.number(), lat: z.number() })).min(2),
    )
    .query(async ({ input }) => {
      const elevations = await Promise.all(input.map((p) => fetchElevation(p.lat, p.lon)));
      return input.slice(0, -1).map((from, i) =>
        computeLeg(from, input[i + 1]!, elevations[i] ?? null, elevations[i + 1] ?? null),
      );
    }),

  tripLegs: publicProcedure
    .input(
      z.object({
        routeStart: z.object({ lon: z.number(), lat: z.number() }),
        cabins: z.array(z.object({ cabinId: z.string(), cabinName: z.string() })).min(1),
      }),
    )
    .query(async ({ input }) => {
      const cabinPoints = await Promise.all(
        input.cabins.map(async ({ cabinId, cabinName }) => {
          try {
            const data = await utQuery<{ cabin: { geojson?: unknown } | null }>(CABIN_BY_ID, {
              id: Number(cabinId),
            });
            const coords = parseGeojsonCoords(data.cabin?.geojson);
            if (!coords) return null;
            return { id: cabinId, name: cabinName, lon: coords[0], lat: coords[1] };
          } catch {
            return null;
          }
        }),
      );

      const validCabinPoints = cabinPoints.filter(
        (p): p is { id: string; name: string; lon: number; lat: number } => p !== null,
      );

      if (validCabinPoints.length === 0) return [];

      const points = [
        { id: "start", name: "Rutestart", lon: input.routeStart.lon, lat: input.routeStart.lat },
        ...validCabinPoints,
      ];

      const elevations = await Promise.all(points.map((p) => fetchElevation(p.lat, p.lon)));

      return points.slice(0, -1).map((from, i) =>
        computeLeg(from, points[i + 1]!, elevations[i] ?? null, elevations[i + 1] ?? null),
      );
    }),
});
