"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

type Grading = "EASY" | "MODERATE" | "TOUGH" | "VERY_TOUGH";
const GRADINGS: Grading[] = ["EASY", "MODERATE", "TOUGH", "VERY_TOUGH"];
const GRADING_LABEL: Record<Grading, string> = {
  EASY: "Lett",
  MODERATE: "Middels",
  TOUGH: "Krevende",
  VERY_TOUGH: "Svært krevende",
};
const GRADING_STYLE: Record<Grading, string> = {
  EASY: "bg-green-500/20 text-green-300",
  MODERATE: "bg-blue-500/20 text-blue-300",
  TOUGH: "bg-orange-500/20 text-orange-300",
  VERY_TOUGH: "bg-red-500/20 text-red-300",
};

export interface SelectedRoute {
  id: string;
  name: string;
  geojson: unknown;
  startLon: number | null;
  startLat: number | null;
  distance: number | null;
  elevationGain: number | null;
  elevationMax: number | null;
  durationDays: number | null;
  durationHours: number | null;
  gradingAb: string | null;
  placeA: string | null;
  placeB: string | null;
}

interface Route {
  id: number;
  name: string;
  gradingAb: Grading | null;
  distance: number | null;
  durationDaysAb: number | null;
  durationHoursAb: number | null;
  durationMinutesAb: number | null;
  elevationGainA: number | null;
  elevationMax: number | null;
  descriptionAb: string | null;
  placeA: string | null;
  placeB: string | null;
  geojson: unknown;
}

interface RoutesConnection {
  totalCount: number;
  edges: { node: Route }[];
}

function extractFirstCoord(geojson: unknown): [number, number] | null {
  try {
    const g = typeof geojson === "string" ? (JSON.parse(geojson) as unknown) : geojson;
    const geo = g as { type?: string; coordinates?: unknown[] };
    if (geo?.type === "LineString" && Array.isArray(geo.coordinates) && geo.coordinates.length >= 1) {
      const first = geo.coordinates[0] as number[];
      if (first && first.length >= 2) return [first[0]!, first[1]!];
    }
  } catch { /* ignore */ }
  return null;
}

function formatDist(m: number | null) {
  if (!m) return null;
  return `${(m / 1000).toFixed(1)} km`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

interface Props {
  onSelect: (route: SelectedRoute) => void;
}

export function StepRoute({ onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeGradings, setActiveGradings] = useState<Grading[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const commonInput = { first: 20, gradings: activeGradings.length ? activeGradings : undefined };

  const { data: listData, isLoading: listLoading } = api.routes.list.useQuery(
    commonInput,
    { enabled: debounced.length === 0 },
  );
  const { data: searchData, isLoading: searchLoading } = api.routes.search.useQuery(
    { ...commonInput, query: debounced },
    { enabled: debounced.length > 0 },
  );

  const raw = debounced ? searchData : listData;
  const connection = (raw as { routes: RoutesConnection } | undefined)?.routes;
  const routes = connection?.edges.map((e) => e.node) ?? [];
  const isLoading = debounced ? searchLoading : listLoading;

  function handleSelect(r: Route) {
    const coords = extractFirstCoord(r.geojson);
    onSelect({
      id: String(r.id),
      name: r.name,
      geojson: r.geojson,
      startLon: coords?.[0] ?? null,
      startLat: coords?.[1] ?? null,
      distance: r.distance,
      elevationGain: r.elevationGainA,
      elevationMax: r.elevationMax,
      durationDays: r.durationDaysAb,
      durationHours: r.durationHoursAb,
      gradingAb: r.gradingAb,
      placeA: r.placeA,
      placeB: r.placeB,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Velg rute</h2>
        <p className="mt-1 text-sm text-white/50">Søk blant merkede ruter fra DNT og UT.no</p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Søk etter rute..."
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10"
      />

      <div className="flex flex-wrap gap-2">
        {GRADINGS.map((g) => {
          const active = activeGradings.includes(g);
          return (
            <button
              key={g}
              onClick={() =>
                setActiveGradings((prev) =>
                  active ? prev.filter((x) => x !== g) : [...prev, g],
                )
              }
              className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
                active ? GRADING_STYLE[g] + " ring-1 ring-current/40" : "bg-white/10 text-white/60 hover:bg-white/15"
              }`}
            >
              {GRADING_LABEL[g]}
            </button>
          );
        })}
        {activeGradings.length > 0 && (
          <button onClick={() => setActiveGradings([])} className="text-sm text-white/40 hover:text-white/70">
            Nullstill
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {!isLoading && routes.length === 0 && (
        <p className="text-center text-white/50">Ingen ruter funnet</p>
      )}

      {!isLoading && routes.length > 0 && (
        <>
          <p className="text-sm text-white/40">
            {debounced ? `${connection?.totalCount ?? 0} treff` : `${routes.length} av ${connection?.totalCount ?? 0} ruter`}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {routes.map((r) => {
              const gs = r.gradingAb ? GRADING_STYLE[r.gradingAb] : null;
              const desc = r.descriptionAb ? stripHtml(r.descriptionAb).slice(0, 100) : null;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className="flex flex-col gap-2 rounded-xl bg-white/10 p-4 text-left transition hover:bg-white/15 hover:ring-2 hover:ring-green-400/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white">{r.name}</span>
                    {r.gradingAb && gs && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${gs}`}>
                        {GRADING_LABEL[r.gradingAb]}
                      </span>
                    )}
                  </div>
                  {(r.placeA ?? r.placeB) && (
                    <p className="text-xs text-white/50">
                      {[r.placeA, r.placeB].filter(Boolean).join(" → ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-white/70">
                    {r.distance && <span>📍 {formatDist(r.distance)}</span>}
                    {r.elevationGainA && <span>⬆ {r.elevationGainA} m</span>}
                    {r.elevationMax && <span>🏔 {r.elevationMax} m</span>}
                    {r.durationDaysAb && <span>📅 {r.durationDaysAb} dag{r.durationDaysAb !== 1 ? "er" : ""}</span>}
                    {!r.durationDaysAb && r.durationHoursAb && <span>⏱ {r.durationHoursAb}t</span>}
                  </div>
                  {desc && <p className="line-clamp-2 text-xs text-white/40">{desc}…</p>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
