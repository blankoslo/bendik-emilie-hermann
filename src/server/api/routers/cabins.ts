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
});
