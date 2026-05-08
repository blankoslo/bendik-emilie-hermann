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

const GRADINGS = ["EASY", "MODERATE", "TOUGH", "VERY_TOUGH"] as const;
type Grading = (typeof GRADINGS)[number];

const ROUTE_FIELDS = `
  id
  name
  gradingAb
  distance
  durationDaysAb
  durationHoursAb
  durationMinutesAb
  elevationGainA
  elevationMax
  descriptionAb
  placeA
  placeB
  geojson
`;

const CONNECTION_FIELDS = `
  totalCount
  pageInfo { hasNextPage endCursor }
  edges { cursor node { ${ROUTE_FIELDS} } }
`;

const ROUTES_QUERY = `
  query Routes($first: Int!, $after: ConnectionCursor, $filter: RouteFilter!) {
    routes(paging: { first: $first, after: $after }, filter: $filter, sorting: []) {
      ${CONNECTION_FIELDS}
    }
  }
`;


const routesInput = z.object({
  first: z.number().int().min(1).max(50).default(20),
  after: z.string().optional(),
  gradings: z.array(z.enum(GRADINGS)).optional(),
});

function buildFilter(gradings?: Grading[]) {
  return {
    status: { eq: "PUBLIC" },
    ...(gradings?.length ? { gradingAb: { in: gradings } } : {}),
  };
}

export const routesRouter = createTRPCRouter({
  list: publicProcedure
    .input(routesInput)
    .query(({ input }) =>
      utQuery(ROUTES_QUERY, {
        first: input.first,
        after: input.after,
        filter: buildFilter(input.gradings),
      }),
    ),

  // UT.no name filter triggers a broken DB JOIN; fetch a larger set and let
  // the client filter by name instead.
  search: publicProcedure
    .input(routesInput.extend({ query: z.string().min(1) }))
    .query(({ input }) =>
      utQuery(ROUTES_QUERY, {
        first: 50,
        after: input.after,
        filter: buildFilter(input.gradings),
      }),
    ),

  near: publicProcedure
    .input(z.object({ lon: z.number(), lat: z.number(), maxDistance: z.number().default(50000) }))
    .query(({ input }) =>
      utQuery(
        `query RoutesNear($input: FindNearInput!) {
          routesNear(input: $input) {
            distance
            route { ${ROUTE_FIELDS} }
          }
        }`,
        { input: { coordinates: [input.lon, input.lat], maxDistance: input.maxDistance } },
      )
    ),
});
