"use client";

import { useState } from "react";
import Link from "next/link";

const UT_GRAPHQL =
  "https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql";

interface Cabin {
  cabinId: string;
  cabinName: string;
  dayNumber: number;
}

interface OfflineCabin extends Cabin {
  lon?: number;
  lat?: number;
}

interface Member {
  name: string;
  experienceLevel?: string | null;
}

interface Props {
  tripId: number;
  name: string;
  routeId?: string | null;
  routeLon: number;
  routeLat: number;
  routeName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  groupName?: string | null;
  members?: Member[];
  cabins: Cabin[];
}

function lon2tile(lon: number, z: number) {
  return Math.floor(((lon + 180) / 360) * (1 << z));
}

function lat2tile(lat: number, z: number) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      (1 << z),
  );
}

function collectTiles(lon: number, lat: number): [number, number, number][] {
  const DELTA = 0.4;
  const tiles: [number, number, number][] = [];
  for (let z = 7; z <= 13; z++) {
    const xMin = lon2tile(lon - DELTA, z);
    const xMax = lon2tile(lon + DELTA, z);
    const yMin = lat2tile(lat + DELTA, z);
    const yMax = lat2tile(lat - DELTA, z);
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tiles.push([z, y, x]);
      }
    }
  }
  return tiles;
}

const tileUrl = (z: number, y: number, x: number) =>
  `https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/${z}/${y}/${x}.png`;

function extractCoords(geojson: unknown): [number, number] | null {
  if (!geojson || typeof geojson !== "object") return null;
  const g = geojson as Record<string, unknown>;
  if (
    g.type === "Point" &&
    Array.isArray(g.coordinates) &&
    g.coordinates.length >= 2
  ) {
    return [g.coordinates[0] as number, g.coordinates[1] as number];
  }
  if (g.type === "Feature" && g.geometry) return extractCoords(g.geometry);
  if (
    g.type === "FeatureCollection" &&
    Array.isArray(g.features) &&
    g.features.length > 0
  ) {
    return extractCoords(g.features[0]);
  }
  return null;
}

function extractLineCoords(geojson: unknown): [number, number][] | null {
  if (!geojson || typeof geojson !== "object") return null;
  const g = geojson as Record<string, unknown>;
  if (g.type === "LineString" && Array.isArray(g.coordinates)) {
    return (g.coordinates as unknown[])
      .filter((c): c is number[] => Array.isArray(c) && c.length >= 2)
      .map((c) => [c[0]!, c[1]!]);
  }
  if (g.type === "MultiLineString" && Array.isArray(g.coordinates)) {
    return (g.coordinates as unknown[][])
      .flat()
      .filter((c): c is number[] => Array.isArray(c) && c.length >= 2)
      .map((c) => [c[0]!, c[1]!]);
  }
  if (g.type === "Feature" && g.geometry) return extractLineCoords(g.geometry);
  if (g.type === "FeatureCollection" && Array.isArray(g.features)) {
    for (const f of g.features) {
      const coords = extractLineCoords(f);
      if (coords?.length) return coords;
    }
  }
  return null;
}

async function fetchRouteCoords(
  lon: number,
  lat: number,
  routeId: string,
): Promise<[number, number][] | null> {
  const res = await fetch(UT_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://ut.no" },
    body: JSON.stringify({
      query: `query RoutesNear($input: FindNearInput!) {
        routesNear(input: $input) { route { id geojson } }
      }`,
      variables: { input: { coordinates: [lon, lat], maxDistance: 15000 } },
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: {
      routesNear?: { route: { id: string | number; geojson?: unknown } }[];
    };
  };
  const found = json.data?.routesNear?.find(
    (r) => String(r.route.id) === routeId,
  );
  return found ? extractLineCoords(found.route.geojson) : null;
}

async function fetchCabinCoords(
  lon: number,
  lat: number,
): Promise<{ id: string; lon: number; lat: number }[]> {
  const res = await fetch(UT_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://ut.no" },
    body: JSON.stringify({
      query: `query CabinsNear($input: FindNearInput!) {
        cabinsNear(input: $input) { cabin { id geojson } }
      }`,
      variables: { input: { coordinates: [lon, lat], maxDistance: 60000 } },
    }),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    data?: {
      cabinsNear?: { cabin: { id: string | number; geojson?: unknown } }[];
    };
  };
  return (json.data?.cabinsNear ?? []).flatMap((item) => {
    const coords = extractCoords(item.cabin.geojson);
    if (!coords) return [];
    return [{ id: String(item.cabin.id), lon: coords[0], lat: coords[1] }];
  });
}

export function TripOfflineDownload({
  tripId,
  name,
  routeId,
  routeLon,
  routeLat,
  routeName,
  startDate,
  endDate,
  groupName,
  members,
  cabins,
}: Props) {
  const [status, setStatus] = useState<
    "idle" | "downloading" | "done" | "error"
  >("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  async function handleDownload() {
    setStatus("downloading");
    setProgress({ done: 0, total: 0 });

    // Ensure SW is active before pre-fetching so tiles get into the SW cache
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.ready;
      } catch {
        // proceed anyway
      }
    }

    const offlineCabins: OfflineCabin[] = cabins.map((c) => ({ ...c }));
    let routeCoords: [number, number][] | null = null;

    await Promise.allSettled([
      fetchRouteCoords(routeLon, routeLat, routeId ?? "").then((coords) => {
        routeCoords = coords;
      }),
      fetchCabinCoords(routeLon, routeLat).then((coordsMap) => {
        for (const item of coordsMap) {
          const cabin = offlineCabins.find((c) => c.cabinId === item.id);
          if (cabin) {
            cabin.lon = item.lon;
            cabin.lat = item.lat;
          }
        }
      }),
    ]);

    localStorage.setItem(
      `offline-trip-${tripId}`,
      JSON.stringify({
        id: tripId,
        name,
        routeId,
        routeLon,
        routeLat,
        routeName,
        startDate,
        endDate,
        groupName,
        members: members ?? [],
        cabins: offlineCabins,
        routeCoords,
      }),
    );

    const tiles = collectTiles(routeLon, routeLat);
    setProgress({ done: 0, total: tiles.length });

    const BATCH = 8;
    let done = 0;
    for (let i = 0; i < tiles.length; i += BATCH) {
      await Promise.allSettled(
        tiles.slice(i, i + BATCH).map(([z, y, x]) => fetch(tileUrl(z, y, x))),
      );
      done += Math.min(BATCH, tiles.length - i);
      setProgress({ done, total: tiles.length });
    }

    setStatus("done");
  }

  if (status === "done") {
    return (
      <Link
        href={`/tur/${tripId}/offline`}
        className="inline-flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
      >
        🗺 Åpne offline kart
      </Link>
    );
  }

  if (status === "downloading") {
    const pct =
      progress.total > 0
        ? Math.round((progress.done / progress.total) * 100)
        : 0;
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm text-white/60">
          Laster ned kartfliser… {pct}%
        </span>
        <div className="h-1.5 w-48 rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleDownload()}
      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/20 hover:text-white"
    >
      ⬇ Last ned til offline
    </button>
  );
}
