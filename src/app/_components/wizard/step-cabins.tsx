"use client";

import { useRef, useEffect, useMemo } from "react";
import type MapLibreGL from "maplibre-gl";
import { api } from "~/trpc/react";
import { Map, MapMarker, MarkerContent, MarkerLabel, MapRoute } from "~/components/ui/map";

export interface CabinStop {
  cabinId: string;
  cabinName: string;
  dayNumber: number;
  serviceLevel: string;
  beds: number;
}

interface NearCabin {
  distance: number;
  cabin: {
    id: number;
    name: string;
    serviceLevel: string;
    bedsStaffed: number | null;
    bedsSelfService: number | null;
    bedsNoService: number | null;
    description: string | null;
    geojson: unknown;
  };
}

function parseCabinCoords(geojson: unknown): [number, number] | null {
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

const SERVICE_LABEL: Record<string, string> = {
  STAFFED: "Betjent",
  SELF_SERVICE: "Selvbetjent",
  NO_SERVICE: "Ubetjent",
  FOOD_SERVICE: "Matservering",
  RENTAL: "Utleie",
  EMERGENCY_SHELTER: "Nødbu",
  NO_SERVICE_NO_BEDS: "Åpen bu",
};

const SERVICE_STYLE: Record<string, string> = {
  STAFFED: "bg-green-500/20 text-green-300",
  SELF_SERVICE: "bg-blue-500/20 text-blue-300",
  NO_SERVICE: "bg-white/20 text-white/70",
  FOOD_SERVICE: "bg-yellow-500/20 text-yellow-300",
  RENTAL: "bg-purple-500/20 text-purple-300",
  EMERGENCY_SHELTER: "bg-red-500/20 text-red-300",
  NO_SERVICE_NO_BEDS: "bg-white/10 text-white/50",
};

function totalBeds(c: NearCabin["cabin"]) {
  return (c.bedsStaffed ?? 0) + (c.bedsSelfService ?? 0) + (c.bedsNoService ?? 0);
}

function formatDist(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function formatHours(h: number) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} t`;
  return `${hrs} t ${mins} min`;
}

interface Props {
  routeLon: number;
  routeLat: number;
  selected: CabinStop[];
  onChange: (cabins: CabinStop[]) => void;
  onNext: () => void;
}

export function StepCabins({ routeLon, routeLat, selected, onChange, onNext }: Props) {
  const mapRef = useRef<MapLibreGL.Map>(null);

  const { data, isLoading } = api.cabins.near.useQuery({
    lon: routeLon,
    lat: routeLat,
    maxDistance: 50000,
  });

  const nearCabins = useMemo(
    () => (data as { cabinsNear?: NearCabin[] } | undefined)?.cabinsNear ?? [],
    [data],
  );

  const sortedSelected = useMemo(
    () => [...selected].sort((a, b) => a.dayNumber - b.dayNumber),
    [selected],
  );

  // Build ordered list of cabin points with coords for the leg stats query
  const legQueryInput = useMemo(() => {
    if (sortedSelected.length < 2) return null;
    const points = sortedSelected
      .map((s) => {
        const found = nearCabins.find((c) => String(c.cabin.id) === s.cabinId);
        if (!found) return null;
        const coords = parseCabinCoords(found.cabin.geojson);
        if (!coords) return null;
        return { id: s.cabinId, name: s.cabinName, lon: coords[0], lat: coords[1] };
      })
      .filter((p): p is { id: string; name: string; lon: number; lat: number } => p !== null);
    return points.length >= 2 ? points : null;
  }, [sortedSelected, nearCabins]);

  const { data: legs, isLoading: legsLoading } = api.cabins.legStats.useQuery(
    legQueryInput!,
    { enabled: legQueryInput !== null },
  );

  // Fit map to selected cabins whenever selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selected.length === 0) return;

    const selectedCoords = selected
      .map((s) => {
        const found = nearCabins.find((c) => String(c.cabin.id) === s.cabinId);
        return found ? parseCabinCoords(found.cabin.geojson) : null;
      })
      .filter((c): c is [number, number] => c !== null);

    if (selectedCoords.length === 0) return;

    const allPoints: [number, number][] = [[routeLon, routeLat], ...selectedCoords];
    const lons = allPoints.map((p) => p[0]);
    const lats = allPoints.map((p) => p[1]);

    map.fitBounds(
      [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
      { padding: 50, maxZoom: 11, duration: 600 },
    );
  }, [selected, nearCabins, routeLon, routeLat]);

  function isSelected(id: number) {
    return selected.some((s) => s.cabinId === String(id));
  }

  function toggle(c: NearCabin["cabin"], dist: number) {
    const id = String(c.id);
    if (selected.some((s) => s.cabinId === id)) {
      onChange(selected.filter((s) => s.cabinId !== id));
    } else {
      const nextDay = selected.length > 0 ? Math.max(...selected.map((s) => s.dayNumber)) + 1 : 1;
      onChange([
        ...selected,
        {
          cabinId: id,
          cabinName: c.name,
          dayNumber: nextDay,
          serviceLevel: c.serviceLevel,
          beds: totalBeds(c),
        },
      ]);
    }
    void dist;
  }

  function adjustDay(cabinId: string, delta: number) {
    onChange(
      selected.map((s) =>
        s.cabinId === cabinId ? { ...s, dayNumber: Math.max(1, s.dayNumber + delta) } : s,
      ),
    );
  }

  // Build per-leg route coordinates for the map
  const legCoords = useMemo(() => {
    return sortedSelected
      .map((s) => {
        const found = nearCabins.find((c) => String(c.cabin.id) === s.cabinId);
        return found ? parseCabinCoords(found.cabin.geojson) : null;
      })
      .filter((c): c is [number, number] => c !== null);
  }, [sortedSelected, nearCabins]);

  // Totals across all legs
  const totals = useMemo(() => {
    if (!legs?.length) return null;
    return {
      distKm: Math.round(legs.reduce((s, l) => s + l.distKm, 0) * 10) / 10,
      elevGainM: legs.every((l) => l.elevGainM != null)
        ? legs.reduce((s, l) => s + (l.elevGainM ?? 0), 0)
        : null,
      estimatedHours: Math.round(legs.reduce((s, l) => s + l.estimatedHours, 0) * 10) / 10,
    };
  }, [legs]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Velg hytter</h2>
        <p className="mt-1 text-sm text-white/50">Hytter innen 50 km fra rutestart</p>
      </div>

      <div className="h-52 overflow-hidden rounded-xl border border-white/10">
        <Map
          ref={mapRef}
          theme="dark"
          center={[routeLon, routeLat]}
          zoom={8}
          className="h-full w-full"
        >
          {/* Route start */}
          <MapMarker longitude={routeLon} latitude={routeLat}>
            <MarkerContent>
              <div className="h-3 w-3 rounded-full border-2 border-white bg-blue-400 shadow" />
            </MarkerContent>
          </MapMarker>

          {/* Unselected nearby cabins */}
          {nearCabins.map(({ cabin }) => {
            const coords = parseCabinCoords(cabin.geojson);
            if (!coords || isSelected(cabin.id)) return null;
            return (
              <MapMarker key={cabin.id} longitude={coords[0]} latitude={coords[1]}>
                <MarkerContent>
                  <div className="h-2 w-2 rounded-full border border-white/40 bg-white/25" />
                </MarkerContent>
              </MapMarker>
            );
          })}

          {/* Route lines between selected cabins */}
          {legCoords.length >= 2 &&
            legCoords.slice(0, -1).map((from, i) => {
              const to = legCoords[i + 1]!;
              const leg = legs?.[i];
              const demanding = leg?.demanding ?? false;
              return (
                <MapRoute
                  key={`leg-${i}`}
                  coordinates={[from, to]}
                  color={demanding ? "#ef4444" : "#22c55e"}
                  width={3}
                  opacity={0.85}
                />
              );
            })}

          {/* Selected cabin markers */}
          {sortedSelected.map((s) => {
            const found = nearCabins.find((c) => String(c.cabin.id) === s.cabinId);
            const coords = found ? parseCabinCoords(found.cabin.geojson) : null;
            if (!coords) return null;
            return (
              <MapMarker key={s.cabinId} longitude={coords[0]} latitude={coords[1]}>
                <MarkerContent>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 text-[10px] font-bold text-white shadow-lg">
                    {s.dayNumber}
                  </div>
                </MarkerContent>
                <MarkerLabel position="bottom" className="text-white">
                  {s.cabinName}
                </MarkerLabel>
              </MapMarker>
            );
          })}
        </Map>
      </div>

      {/* Selected stops */}
      {selected.length > 0 && (
        <div className="rounded-xl border border-green-400/20 bg-green-900/20 p-4">
          <p className="mb-3 text-sm font-semibold text-green-300">Valgte stopp ({selected.length})</p>
          <div className="flex flex-col gap-2">
            {sortedSelected.map((s) => (
              <div key={s.cabinId} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2">
                <span className="text-sm text-white">
                  <span className="mr-2 font-mono text-white/40">Dag {s.dayNumber}</span>
                  {s.cabinName}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustDay(s.cabinId, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs hover:bg-white/20"
                  >
                    −
                  </button>
                  <button
                    onClick={() => adjustDay(s.cabinId, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs hover:bg-white/20"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onChange(selected.filter((x) => x.cabinId !== s.cabinId))}
                    className="ml-1 text-xs text-white/30 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leg stats */}
      {legQueryInput !== null && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-white/70">Etapper</p>
          {legsLoading && (
            <div className="flex flex-col gap-2">
              {legQueryInput.slice(0, -1).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          )}
          {!legsLoading && legs?.map((leg, i) => (
            <div
              key={`${leg.fromId}-${leg.toId}`}
              className={`flex flex-col gap-1 rounded-xl px-4 py-3 ${
                leg.demanding
                  ? "border border-red-500/30 bg-red-900/20"
                  : "bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white">
                  <span className="mr-1 font-mono text-white/40">Dag {sortedSelected[i]?.dayNumber}→{sortedSelected[i + 1]?.dayNumber}</span>
                  {leg.fromName} → {leg.toName}
                </span>
                {leg.demanding && (
                  <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">
                    Krevende
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-white/60">
                <span>📍 {leg.distKm} km</span>
                {leg.elevGainM != null && <span>⬆ {leg.elevGainM.toLocaleString("no")} hm</span>}
                {leg.elevLossM != null && <span>⬇ {leg.elevLossM.toLocaleString("no")} hm</span>}
                <span>⏱ {formatHours(leg.estimatedHours)}</span>
              </div>
            </div>
          ))}
          {!legsLoading && totals && (
            <div className="flex gap-4 rounded-xl bg-white/5 px-4 py-2 text-xs text-white/50">
              <span className="font-semibold text-white/70">Totalt</span>
              <span>📍 {totals.distKm} km</span>
              {totals.elevGainM != null && <span>⬆ {totals.elevGainM.toLocaleString("no")} hm</span>}
              <span>⏱ {formatHours(totals.estimatedHours)}</span>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {!isLoading && nearCabins.length === 0 && (
        <p className="text-center text-white/50">Ingen hytter funnet nær rutestart</p>
      )}

      {!isLoading && nearCabins.length > 0 && (
        <>
          <p className="text-sm text-white/40">{nearCabins.length} hytter funnet</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {nearCabins.map(({ cabin, distance }) => {
              const sel = isSelected(cabin.id);
              const beds = totalBeds(cabin);
              const sStyle = SERVICE_STYLE[cabin.serviceLevel] ?? "bg-white/10 text-white/50";
              const sLabel = SERVICE_LABEL[cabin.serviceLevel] ?? cabin.serviceLevel;
              return (
                <button
                  key={cabin.id}
                  onClick={() => toggle(cabin, distance)}
                  className={`flex flex-col gap-2 rounded-xl p-4 text-left transition ${
                    sel
                      ? "bg-green-900/40 ring-2 ring-green-400/60"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white">{cabin.name}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      {sel && <span className="text-green-400">✓</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sStyle}`}>
                        {sLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm text-white/60">
                    <span>📍 {formatDist(distance)}</span>
                    {beds > 0 && <span>🛏 {beds} senger</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="flex justify-between pt-2">
        <p className="text-sm text-white/40">
          {selected.length === 0
            ? "Valgfritt – du kan fortsette uten å velge hytter"
            : `${selected.length} hytte${selected.length !== 1 ? "r" : ""} valgt`}
        </p>
        <button
          onClick={onNext}
          className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600"
        >
          Neste →
        </button>
      </div>
    </div>
  );
}
