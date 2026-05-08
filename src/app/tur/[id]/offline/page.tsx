"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapRoute,
  useMap,
} from "~/components/ui/map";

function RouteFitter({ coords }: { coords: [number, number][] }) {
  const { map, isLoaded } = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!map || !isLoaded || fitted.current || coords.length < 2) return;
    fitted.current = true;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 60, duration: 800, maxZoom: 13 },
    );
  }, [map, isLoaded, coords]);
  return null;
}

interface OfflineCabin {
  cabinId: string;
  cabinName: string;
  dayNumber: number;
  lon?: number;
  lat?: number;
}

interface OfflineMember {
  name: string;
  experienceLevel?: string | null;
}

interface OfflineTripData {
  id: number;
  name: string;
  routeLon: number;
  routeLat: number;
  routeName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  groupName?: string | null;
  members?: OfflineMember[];
  cabins: OfflineCabin[];
  routeCoords?: [number, number][] | null;
}

const KARTVERKET_STYLE = {
  version: 8 as const,
  sources: {
    kartverket: {
      type: "raster" as const,
      tiles: [
        "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
      ],
      tileSize: 256,
      attribution: "© Kartverket",
    },
  },
  layers: [{ id: "bg", type: "raster" as const, source: "kartverket" }],
};

export default function OfflineTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trip, setTrip] = useState<OfflineTripData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`offline-trip-${id}`);
    if (stored) {
      try {
        setTrip(JSON.parse(stored) as OfflineTripData);
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [id]);

  const sortedCabins = [...(trip?.cabins ?? [])].sort(
    (a, b) => a.dayNumber - b.dayNumber,
  );

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0f2d1f] text-white">
        <p className="text-white/60">
          Ingen offline-data funnet for denne turen.
        </p>
        <p className="text-sm text-white/40">
          Last ned turen fra detaljsiden mens du er online.
        </p>
        <Link
          href={`/tur/${id}`}
          className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          ← Tilbake til tur
        </Link>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f2d1f]">
        <div className="h-2 w-2 animate-ping rounded-full bg-white/40" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden bg-[#0f2d1f] text-white"
      style={{ height: "100dvh" }}
    >
      <header className="flex h-14 shrink-0 items-center gap-3 bg-[#0a1a12] px-4">
        <Link
          href={`/tur/${id}`}
          className="text-sm text-white/50 hover:text-white"
        >
          ←
        </Link>
        <span className="truncate text-sm font-semibold">{trip.name}</span>
        {trip.routeName && (
          <span className="ml-auto shrink-0 text-xs text-white/40">
            {trip.routeName}
          </span>
        )}
      </header>

      <div className="relative min-h-0 flex-1">
        <Map
          className="absolute inset-0"
          styles={{ light: KARTVERKET_STYLE, dark: KARTVERKET_STYLE }}
          center={[trip.routeLon, trip.routeLat]}
          zoom={11}
          theme="dark"
        >
          {/* Route line */}
          {trip.routeCoords && trip.routeCoords.length >= 2 && (
            <>
              <RouteFitter coords={trip.routeCoords} />
              <MapRoute
                id="casing"
                coordinates={trip.routeCoords}
                color="rgba(255,255,255,0.85)"
                width={7}
                opacity={1}
                interactive={false}
              />
              <MapRoute
                id="main"
                coordinates={trip.routeCoords}
                color="#16a34a"
                width={4}
                opacity={1}
                interactive={false}
              />
            </>
          )}

          {/* Start marker */}
          <MapMarker longitude={trip.routeLon} latitude={trip.routeLat}>
            <MarkerContent>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-xs font-bold text-white shadow-lg">
                ▶
              </div>
            </MarkerContent>
            <MarkerTooltip>{trip.routeName ?? "Start"}</MarkerTooltip>
          </MapMarker>

          {/* Cabin markers */}
          {sortedCabins
            .filter((c) => c.lon != null && c.lat != null)
            .map((c) => (
              <MapMarker
                key={c.cabinId}
                longitude={c.lon!}
                latitude={c.lat!}
              >
                <MarkerContent>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-green-700 text-sm font-bold text-white shadow-lg">
                    {c.dayNumber}
                  </div>
                </MarkerContent>
                <MarkerTooltip>Dag {c.dayNumber}: {c.cabinName}</MarkerTooltip>
              </MapMarker>
            ))}
        </Map>

        <div className="absolute bottom-4 left-4 right-4 mx-auto max-w-sm rounded-2xl bg-black/60 p-3 backdrop-blur-md">
          {(trip.startDate ?? trip.groupName ?? (trip.members?.length ?? 0) > 0) && (
            <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">
              {trip.startDate && trip.endDate && (
                <span>📅 {trip.startDate} → {trip.endDate}</span>
              )}
              {trip.groupName && <span>👥 {trip.groupName}</span>}
              {(trip.members?.length ?? 0) > 0 && (
                <span>{trip.members!.map((m) => m.name).join(", ")}</span>
              )}
            </div>
          )}
          {sortedCabins.length > 0 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                Etapper
              </p>
              <div className="flex flex-col gap-1.5">
                {sortedCabins.map((c) => (
                  <div
                    key={c.cabinId}
                    className="flex items-center gap-2 text-sm text-white"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold">
                      {c.dayNumber}
                    </span>
                    <span className="truncate">{c.cabinName}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
