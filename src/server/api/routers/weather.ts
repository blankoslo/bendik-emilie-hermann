import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const YR_BASE = "https://api.met.no";
const USER_AGENT = "friluftskompis/1.0 hermann.elton@blank.no";

async function fetchYr(path: string) {
  const res = await fetch(`${YR_BASE}${path}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: `Yr: ${res.status}` });
  return res.json() as Promise<unknown>;
}

async function resolvePlace(place: string): Promise<{ lat: number; lon: number; name: string }> {
  const url = `https://ws.geonorge.no/stedsnavn/v1/sted?sok=${encodeURIComponent(place)}&treffPerSide=1`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: `Geonorge: ${res.status}` });
  const data = (await res.json()) as {
    navn?: { representasjonspunkt?: { nord: number; øst: number }; stedsnavn?: { skrivemåte: string }[] }[];
  };
  const hit = data.navn?.[0];
  const coords = hit?.representasjonspunkt;
  if (!coords) throw new TRPCError({ code: "NOT_FOUND", message: `Place not found: ${place}` });
  return {
    lat: coords.nord,
    lon: coords.øst,
    name: hit?.stedsnavn?.[0]?.skrivemåte ?? place,
  };
}

export const weatherRouter = createTRPCRouter({
  forecast: publicProcedure
    .input(z.object({ lat: z.number(), lon: z.number() }))
    .query(async ({ input }) => {
      return fetchYr(`/weatherapi/locationforecast/2.0/compact?lat=${input.lat}&lon=${input.lon}`);
    }),

  nowcast: publicProcedure
    .input(z.object({ lat: z.number(), lon: z.number() }))
    .query(async ({ input }) => {
      return fetchYr(`/weatherapi/nowcast/2.0/complete?lat=${input.lat}&lon=${input.lon}`);
    }),

  forecastByPlace: publicProcedure
    .input(z.object({ place: z.string().min(1) }))
    .query(async ({ input }) => {
      const { lat, lon, name } = await resolvePlace(input.place);
      const weather = await fetchYr(
        `/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
      );
      return { place: name, lat, lon, weather };
    }),
});
