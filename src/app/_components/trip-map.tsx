"use client";

import { useEffect, useRef, useState } from "react";
import type MapLibreGL from "maplibre-gl";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  MapPopup,
  MapClusterLayer,
  useMap,
} from "~/components/ui/map";

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

const GRADING_COLOR: Record<string, string> = {
  EASY: "#16a34a",
  MODERATE: "#2563eb",
  TOUGH: "#ea580c",
  VERY_TOUGH: "#dc2626",
};

const GRADING_LABEL: Record<string, string> = {
  EASY: "Lett",
  MODERATE: "Middels",
  TOUGH: "Krevende",
  VERY_TOUGH: "Svært krevende",
};

export interface RouteForMap {
  id: number;
  name: string;
  gradingAb: string | null;
  distance: number | null;
  durationHoursAb: number | null;
  durationMinutesAb: number | null;
  geojson: unknown;
}

export interface CabinForMap {
  id: number;
  name: string;
  serviceLevel: string;
  geojson: unknown;
}

function parseCabinCoords(geojson: unknown): [number, number] | null {
  try {
    const g = typeof geojson === "string" ? (JSON.parse(geojson) as unknown) : geojson;
    const geo = g as { type?: string; coordinates?: number[] };
    if (geo?.type === "Point" && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      return [geo.coordinates[0]!, geo.coordinates[1]!];
    }
  } catch { /* ignore */ }
  return null;
}

function buildCabinsGeoJSON(cabins: CabinForMap[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  for (const c of cabins) {
    const coords = parseCabinCoords(c.geojson);
    if (coords) {
      features.push({
        type: "Feature",
        properties: { id: c.id, name: c.name, serviceLevel: c.serviceLevel },
        geometry: { type: "Point", coordinates: coords },
      });
    }
  }
  return { type: "FeatureCollection", features };
}

interface HoveredRoute {
  id: number;
  name: string;
  grading: string | null;
  distance: number | null;
  durationHoursAb: number | null;
  durationMinutesAb: number | null;
  lon: number;
  lat: number;
}

interface TripMapProps {
  onLocationSelect: (lon: number, lat: number) => void;
  selectedLocation: { lon: number; lat: number } | null;
  routes: RouteForMap[];
  cabins: CabinForMap[];
}

function parseLineString(geojson: unknown): [number, number][] | null {
  try {
    const g = typeof geojson === "string" ? (JSON.parse(geojson) as unknown) : geojson;
    const geo = g as { type?: string; coordinates?: unknown[] };
    if (geo?.type === "LineString" && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      return geo.coordinates as [number, number][];
    }
  } catch {
    // ignore
  }
  return null;
}

function buildRoutesGeoJSON(routes: RouteForMap[]): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  for (const r of routes) {
    const coords = parseLineString(r.geojson);
    if (!coords || coords.length < 2) continue;
    features.push({
      type: "Feature",
      properties: {
        id: r.id,
        name: r.name,
        grading: r.gradingAb ?? null,
        distance: r.distance,
        durationHoursAb: r.durationHoursAb,
        durationMinutesAb: r.durationMinutesAb,
      },
      geometry: { type: "LineString", coordinates: coords },
    });
  }
  return { type: "FeatureCollection", features };
}

const SOURCE_ID = "trip-routes";
const CASING_ID = "trip-routes-casing";
const LAYER_ID = "trip-routes-line";
const HIT_ID = "trip-routes-hit";

function RouteLayers({
  routes,
  onHover,
  onLeave,
}: {
  routes: RouteForMap[];
  onHover: (h: HoveredRoute) => void;
  onLeave: () => void;
}) {
  const { map, isLoaded } = useMap();
  const callbacksRef = useRef({ onHover, onLeave });
  callbacksRef.current = { onHover, onLeave };

  // Set up source + layers once on load
  useEffect(() => {
    if (!map || !isLoaded) return;

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    // White casing drawn beneath the colored line
    map.addLayer({
      id: CASING_ID,
      type: "line",
      source: SOURCE_ID,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "rgba(255,255,255,0.75)", "line-width": 7 },
    });

    map.addLayer({
      id: LAYER_ID,
      type: "line",
      source: SOURCE_ID,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": [
          "match",
          ["get", "grading"],
          "EASY", GRADING_COLOR.EASY!,
          "MODERATE", GRADING_COLOR.MODERATE!,
          "TOUGH", GRADING_COLOR.TOUGH!,
          "VERY_TOUGH", GRADING_COLOR.VERY_TOUGH!,
          "#6b7280",
        ],
        "line-width": 4,
        "line-opacity": 1,
      },
    });

    // Wide invisible hit layer for easy hover
    map.addLayer({
      id: HIT_ID,
      type: "line",
      source: SOURCE_ID,
      paint: { "line-color": "rgba(0,0,0,0)", "line-width": 20 },
    });

    const handleMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feat = e.features?.[0];
      if (!feat) return;
      map.getCanvas().style.cursor = "pointer";
      callbacksRef.current.onHover({
        id: feat.properties?.id as number,
        name: feat.properties?.name as string,
        grading: feat.properties?.grading as string | null,
        distance: feat.properties?.distance as number | null,
        durationHoursAb: feat.properties?.durationHoursAb as number | null,
        durationMinutesAb: feat.properties?.durationMinutesAb as number | null,
        lon: e.lngLat.lng,
        lat: e.lngLat.lat,
      });
    };

    const handleLeave = () => {
      map.getCanvas().style.cursor = "";
      callbacksRef.current.onLeave();
    };

    map.on("mousemove", HIT_ID, handleMove);
    map.on("mouseleave", HIT_ID, handleLeave);

    return () => {
      map.off("mousemove", HIT_ID, handleMove);
      map.off("mouseleave", HIT_ID, handleLeave);
      try {
        if (map.getLayer(HIT_ID)) map.removeLayer(HIT_ID);
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getLayer(CASING_ID)) map.removeLayer(CASING_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch { /* ignore */ }
    };
  }, [map, isLoaded]);

  // Update source data when routes change
  useEffect(() => {
    if (!map || !isLoaded) return;
    const source = map.getSource(SOURCE_ID) as MapLibreGL.GeoJSONSource | null;
    source?.setData(buildRoutesGeoJSON(routes));
  }, [map, isLoaded, routes]);

  return null;
}

function MapClickHandler({ onClick }: { onClick: (lon: number, lat: number) => void }) {
  const { map, isLoaded } = useMap();
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    if (!map || !isLoaded) return;
    const handler = (e: MapLibreGL.MapMouseEvent) => {
      // Don't set location when clicking on a route line
      const features = map.queryRenderedFeatures(e.point, { layers: [HIT_ID] });
      if (features.length > 0) return;
      onClickRef.current(e.lngLat.lng, e.lngLat.lat);
    };
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [map, isLoaded]);

  return null;
}

export function TripMap({ onLocationSelect, selectedLocation, routes, cabins }: TripMapProps) {
  const [hoveredRoute, setHoveredRoute] = useState<HoveredRoute | null>(null);
  const cabinGeoJSON = buildCabinsGeoJSON(cabins);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-white/10">
      <Map
        center={[10.7522, 59.9139]}
        zoom={5}
        styles={{ light: KARTVERKET_STYLE, dark: KARTVERKET_STYLE }}
      >
        <RouteLayers
          routes={routes}
          onHover={setHoveredRoute}
          onLeave={() => setHoveredRoute(null)}
        />

        <MapClusterLayer
          data={cabinGeoJSON}
          clusterColors={["#f59e0b", "#b45309", "#78350f"]}
          pointColor="#f59e0b"
          clusterRadius={40}
        />

        <MapClickHandler onClick={onLocationSelect} />

        {hoveredRoute && (
          <MapPopup
            longitude={hoveredRoute.lon}
            latitude={hoveredRoute.lat}
            closeOnClick={false}
            anchor="bottom"
          >
            <div className="min-w-[160px] space-y-1">
              <p className="font-semibold text-sm leading-tight">{hoveredRoute.name}</p>
              {hoveredRoute.grading && (
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: GRADING_COLOR[hoveredRoute.grading] ?? "#6b7280" }}
                >
                  {GRADING_LABEL[hoveredRoute.grading] ?? hoveredRoute.grading}
                </span>
              )}
              <div className="flex gap-3 text-xs text-muted-foreground pt-0.5">
                {hoveredRoute.distance && (
                  <span>📍 {(hoveredRoute.distance / 1000).toFixed(1)} km</span>
                )}
                {(hoveredRoute.durationHoursAb ?? hoveredRoute.durationMinutesAb) && (
                  <span>
                    ⏱{" "}
                    {[
                      hoveredRoute.durationHoursAb ? `${hoveredRoute.durationHoursAb}t` : null,
                      hoveredRoute.durationMinutesAb ? `${hoveredRoute.durationMinutesAb}min` : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                )}
              </div>
            </div>
          </MapPopup>
        )}

        {selectedLocation && (
          <MapMarker longitude={selectedLocation.lon} latitude={selectedLocation.lat}>
            <MarkerContent>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-sm shadow-lg ring-2 ring-white">
                📍
              </div>
            </MarkerContent>
          </MapMarker>
        )}

        <MapControls
          showZoom
          showLocate
          onLocate={(coords) => onLocationSelect(coords.longitude, coords.latitude)}
        />
      </Map>
    </div>
  );
}
