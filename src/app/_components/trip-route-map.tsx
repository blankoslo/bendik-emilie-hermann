"use client";

import { useEffect, useRef } from "react";
import type MapLibreGL from "maplibre-gl";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapControls,
  useMap,
} from "~/components/ui/map";
import { api } from "~/trpc/react";

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
  layers: [{ id: "topo", type: "raster" as const, source: "kartverket" }],
};

interface TripCabin {
  cabinId: string;
  cabinName: string;
  dayNumber: number;
}

interface NearRoute {
  id: number;
  name: string;
  geojson: unknown;
}

interface NearCabin {
  id: number;
  name: string;
  serviceLevel: string;
  geojson: unknown;
}

function parsePoint(geojson: unknown): [number, number] | null {
  try {
    const g = typeof geojson === "string" ? (JSON.parse(geojson) as unknown) : geojson;
    const geo = g as { type?: string; coordinates?: number[] };
    if (
      geo?.type === "Point" &&
      Array.isArray(geo.coordinates) &&
      geo.coordinates.length >= 2
    ) {
      return [geo.coordinates[0]!, geo.coordinates[1]!];
    }
  } catch {
    /* ignore */
  }
  return null;
}

function parseLineString(geojson: unknown): [number, number][] | null {
  try {
    const g = typeof geojson === "string" ? (JSON.parse(geojson) as unknown) : geojson;
    const geo = g as { type?: string; coordinates?: unknown[] };
    if (
      geo?.type === "LineString" &&
      Array.isArray(geo.coordinates) &&
      geo.coordinates.length >= 2
    ) {
      return geo.coordinates as [number, number][];
    }
  } catch {
    /* ignore */
  }
  return null;
}

const BG_SRC = "trip-bg-routes";
const BG_LINE = "trip-bg-line";
const MAIN_SRC = "trip-main-route";
const MAIN_CASING = "trip-main-casing";
const MAIN_LINE = "trip-main-line";

function RouteLines({
  routeId,
  routesNear,
}: {
  routeId?: string | null;
  routesNear: NearRoute[];
}) {
  const { map, isLoaded } = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded) return;

    map.addSource(BG_SRC, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    map.addLayer({
      id: BG_LINE,
      type: "line",
      source: BG_SRC,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#6b7280", "line-width": 2, "line-opacity": 0.35 },
    });

    map.addSource(MAIN_SRC, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    map.addLayer({
      id: MAIN_CASING,
      type: "line",
      source: MAIN_SRC,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "rgba(255,255,255,0.85)", "line-width": 7 },
    });
    map.addLayer({
      id: MAIN_LINE,
      type: "line",
      source: MAIN_SRC,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#16a34a", "line-width": 4, "line-opacity": 1 },
    });

    return () => {
      try {
        for (const id of [BG_LINE, MAIN_CASING, MAIN_LINE]) {
          if (map.getLayer(id)) map.removeLayer(id);
        }
        for (const id of [BG_SRC, MAIN_SRC]) {
          if (map.getSource(id)) map.removeSource(id);
        }
      } catch {
        /* ignore */
      }
    };
  }, [map, isLoaded]);

  useEffect(() => {
    if (!map || !isLoaded || routesNear.length === 0) return;

    const bgFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];
    let mainCoords: [number, number][] | null = null;

    for (const route of routesNear) {
      const coords = parseLineString(route.geojson);
      if (!coords || coords.length < 2) continue;

      if (routeId && String(route.id) === String(routeId)) {
        mainCoords = coords;
      } else {
        bgFeatures.push({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        });
      }
    }

    const bgSrc = map.getSource(BG_SRC) as MapLibreGL.GeoJSONSource | null;
    bgSrc?.setData({ type: "FeatureCollection", features: bgFeatures });

    const mainSrc = map.getSource(MAIN_SRC) as MapLibreGL.GeoJSONSource | null;
    mainSrc?.setData({
      type: "FeatureCollection",
      features: mainCoords
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: mainCoords },
            },
          ]
        : [],
    });

    // Fit to trip route once on first load
    if (mainCoords && !fittedRef.current) {
      fittedRef.current = true;
      const lngs = mainCoords.map((c) => c[0]);
      const lats = mainCoords.map((c) => c[1]);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 60, duration: 800, maxZoom: 13 },
      );
    }
  }, [map, isLoaded, routesNear, routeId]);

  return null;
}

export interface Props {
  routeLon: number;
  routeLat: number;
  routeId?: string | null;
  tripCabins: TripCabin[];
}

export function TripRouteMap({ routeLon, routeLat, routeId, tripCabins }: Props) {
  const { data: routesNearData } = api.routes.near.useQuery({
    lon: routeLon,
    lat: routeLat,
    maxDistance: 25000,
  });

  const { data: cabinsNearData } = api.cabins.near.useQuery({
    lon: routeLon,
    lat: routeLat,
    maxDistance: 50000,
  });

  const routesNear =
    (routesNearData as { routesNear?: { route: NearRoute }[] } | undefined)?.routesNear?.map(
      (x) => x.route,
    ) ?? [];

  const cabinsNear =
    (cabinsNearData as { cabinsNear?: { cabin: NearCabin }[] } | undefined)?.cabinsNear?.map(
      (x) => x.cabin,
    ) ?? [];

  const cabinDayLookup: Partial<Record<string, number>> = {};
  for (const tc of tripCabins) {
    cabinDayLookup[tc.cabinId] = tc.dayNumber;
  }

  const cabinsWithCoords: {
    cabin: NearCabin;
    coords: [number, number];
    dayNumber?: number;
  }[] = [];

  for (const cabin of cabinsNear) {
    const coords = parsePoint(cabin.geojson);
    if (!coords) continue;
    const dayNumber = cabinDayLookup[String(cabin.id)];
    cabinsWithCoords.push({ cabin, coords, dayNumber });
  }

  const tripCabinsOnMap = cabinsWithCoords.filter((c) => c.dayNumber !== undefined);
  const otherCabins = cabinsWithCoords.filter((c) => c.dayNumber === undefined);

  const SERVICE_EMOJI: Record<string, string> = {
    STAFFED: "🏠",
    SELF_SERVICE: "🔑",
    NO_SERVICE: "⛺",
    EMERGENCY_SHELTER: "🆘",
    FOOD_SERVICE: "🍽",
    RENTAL: "🏡",
    NO_SERVICE_NO_BEDS: "🪨",
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-white/10">
        <Map
          center={[routeLon, routeLat]}
          zoom={9}
          styles={{ light: KARTVERKET_STYLE, dark: KARTVERKET_STYLE }}
        >
          <RouteLines routeId={routeId} routesNear={routesNear} />

          {/* Nearby cabins (not part of trip) */}
          {otherCabins.map(({ cabin, coords }) => (
            <MapMarker key={cabin.id} longitude={coords[0]} latitude={coords[1]}>
              <MarkerContent>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-500/60 bg-amber-900/70 text-xs shadow-md">
                  {SERVICE_EMOJI[cabin.serviceLevel] ?? "🏕"}
                </div>
              </MarkerContent>
              <MarkerTooltip>{cabin.name}</MarkerTooltip>
            </MapMarker>
          ))}

          {/* Trip's selected cabins — numbered */}
          {tripCabinsOnMap
            .sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0))
            .map(({ cabin, coords, dayNumber }) => (
              <MapMarker key={cabin.id} longitude={coords[0]} latitude={coords[1]}>
                <MarkerContent>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-green-600 text-sm font-bold text-white shadow-lg">
                    {dayNumber}
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  Dag {dayNumber}: {cabin.name}
                </MarkerTooltip>
              </MapMarker>
            ))}

          {/* Start marker */}
          <MapMarker longitude={routeLon} latitude={routeLat}>
            <MarkerContent>
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-xs font-bold text-white shadow-lg">
                ▶
              </div>
            </MarkerContent>
            <MarkerTooltip>Startpunkt</MarkerTooltip>
          </MapMarker>

          <MapControls showZoom showLocate position="bottom-right" />
        </Map>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1 text-xs text-white/50">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-5 rounded bg-green-600" />
          Tutrute
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-5 rounded bg-gray-500/40" />
          Andre ruter
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white bg-green-600 text-[9px] font-bold text-white">
            1
          </span>
          Hyttestopp
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-amber-500/60 bg-amber-900/70 text-[9px]">
            🏕
          </span>
          Hytter i området
        </span>
      </div>
    </div>
  );
}
