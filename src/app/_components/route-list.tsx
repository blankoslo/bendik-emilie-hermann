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

type DurationBucket = "under3h" | "threeToEight" | "langdag" | "flerdag";
const DURATION_BUCKETS: { value: DurationBucket; label: string }[] = [
  { value: "under3h",      label: "< 3 timer" },
  { value: "threeToEight", label: "3–8 timer" },
  { value: "langdag",      label: "Lang dag" },
  { value: "flerdag",      label: "Flerdagers" },
];

type DistanceBucket = "short" | "medium" | "long";
const DISTANCE_BUCKETS: { value: DistanceBucket; label: string }[] = [
  { value: "short",  label: "< 5 km" },
  { value: "medium", label: "5–15 km" },
  { value: "long",   label: "> 15 km" },
];

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
}

interface RoutesConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  edges: { cursor: string; node: Route }[];
}

const GRADING_STYLE: Record<Grading, { badge: string; filter: string; activeFilter: string }> = {
  EASY:       { badge: "bg-green-500/20 text-green-300",  filter: "bg-white/10 text-white/60", activeFilter: "bg-green-500/30 text-green-300 ring-1 ring-green-400/40" },
  MODERATE:   { badge: "bg-blue-500/20 text-blue-300",    filter: "bg-white/10 text-white/60", activeFilter: "bg-blue-500/30 text-blue-300 ring-1 ring-blue-400/40" },
  TOUGH:      { badge: "bg-orange-500/20 text-orange-300",filter: "bg-white/10 text-white/60", activeFilter: "bg-orange-500/30 text-orange-300 ring-1 ring-orange-400/40" },
  VERY_TOUGH: { badge: "bg-red-500/20 text-red-300",      filter: "bg-white/10 text-white/60", activeFilter: "bg-red-500/30 text-red-300 ring-1 ring-red-400/40" },
};

function formatDuration(days: number | null, hours: number | null, minutes: number | null) {
  const parts: string[] = [];
  if (days) parts.push(`${days} dag${days !== 1 ? "er" : ""}`);
  if (hours) parts.push(`${hours} t`);
  if (minutes) parts.push(`${minutes} min`);
  return parts.join(" ") || null;
}

function formatDistance(meters: number | null) {
  if (!meters) return null;
  return `${(meters / 1000).toFixed(1)} km`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function routeTotalHours(route: Route): number | null {
  const days = route.durationDaysAb ?? 0;
  const hours = route.durationHoursAb ?? 0;
  const minutes = (route.durationMinutesAb ?? 0) / 60;
  if (days === 0 && hours === 0 && route.durationMinutesAb === null) return null;
  return days * 8 + hours + minutes;
}

function matchesDuration(route: Route, bucket: DurationBucket | null): boolean {
  if (!bucket) return true;
  const days = route.durationDaysAb ?? 0;
  const h = routeTotalHours(route);
  if (bucket === "flerdag") return days > 0;
  if (h === null) return false;
  if (bucket === "under3h") return days === 0 && h < 3;
  if (bucket === "threeToEight") return days === 0 && h >= 3 && h <= 8;
  return days === 0 && h > 8;
}

function matchesDistance(route: Route, bucket: DistanceBucket | null): boolean {
  if (!bucket) return true;
  const km = route.distance ? route.distance / 1000 : null;
  if (km === null) return false;
  if (bucket === "short") return km < 5;
  if (bucket === "medium") return km >= 5 && km <= 15;
  return km > 15;
}

interface RouteListProps {
  near?: { lon: number; lat: number };
}

export function RouteList({ near }: RouteListProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeGradings, setActiveGradings] = useState<Grading[]>([]);
  const [durationFilter, setDurationFilter] = useState<DurationBucket | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<DistanceBucket | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  function toggleGrading(g: Grading) {
    setActiveGradings((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  const listInput = {
    first: 50,
    gradings: activeGradings.length ? activeGradings : undefined,
  };

  const { data: listData, isLoading: listLoading } = api.routes.list.useQuery(
    listInput,
    { enabled: !near },
  );

  const { data: nearData, isLoading: nearLoading } = api.routes.near.useQuery(
    { lon: near?.lon ?? 0, lat: near?.lat ?? 0 },
    { enabled: !!near },
  );

  let routes: Route[];
  let isLoading: boolean;

  if (near) {
    const nearRoutes = (nearData as { routesNear?: { distance: number; route: Route }[] } | undefined)?.routesNear ?? [];
    routes = nearRoutes.map((r) => r.route);
    isLoading = nearLoading;
  } else {
    const connection = (listData as { routes: RoutesConnection } | undefined)?.routes;
    routes = connection?.edges.map((e) => e.node) ?? [];
    isLoading = listLoading;
  }

  // Client-side filters: name search, duration, distance
  const q = debouncedSearch.toLowerCase();
  const filteredRoutes = routes
    .filter((r) =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.placeA?.toLowerCase().includes(q) ?? false) ||
      (r.placeB?.toLowerCase().includes(q) ?? false) ||
      r.descriptionAb?.toLowerCase().includes(q),
    )
    .filter((r) => matchesDuration(r, durationFilter))
    .filter((r) => matchesDistance(r, distanceFilter));
  const clientFiltered = filteredRoutes.length !== routes.length;

  return (
    <section className="w-full max-w-4xl">
      <div className="mb-4">
        <h2 className="mb-1 text-2xl font-bold text-white">Turforslag</h2>
        <p className="mb-4 text-sm text-white/50">Merkede ruter fra DNT og UT.no</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Søk etter tur..."
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10"
        />
      </div>

      {/* Difficulty filter */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16">Vanskel.</span>
        {GRADINGS.map((g) => {
          const isActive = activeGradings.includes(g);
          const style = GRADING_STYLE[g];
          return (
            <button
              key={g}
              onClick={() => toggleGrading(g)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${isActive ? style.activeFilter : style.filter} hover:brightness-110`}
            >
              {GRADING_LABEL[g]}
            </button>
          );
        })}
        {activeGradings.length > 0 && (
          <button
            onClick={() => setActiveGradings([])}
            className="rounded-full px-3 py-1 text-sm text-white/40 hover:text-white/70"
          >
            ✕
          </button>
        )}
      </div>

      {/* Duration filter */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16">Varighet</span>
        {DURATION_BUCKETS.map((b) => {
          const isActive = durationFilter === b.value;
          return (
            <button
              key={b.value}
              onClick={() => setDurationFilter(isActive ? null : b.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-all hover:brightness-110 ${
                isActive
                  ? "bg-amber-500/30 text-amber-300 ring-1 ring-amber-400/40"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {/* Distance filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16">Distanse</span>
        {DISTANCE_BUCKETS.map((b) => {
          const isActive = distanceFilter === b.value;
          return (
            <button
              key={b.value}
              onClick={() => setDistanceFilter(isActive ? null : b.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-all hover:brightness-110 ${
                isActive
                  ? "bg-cyan-500/30 text-cyan-300 ring-1 ring-cyan-400/40"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {!isLoading && filteredRoutes.length === 0 && (
        <p className="text-center text-white/50">
          {routes.length > 0 ? "Ingen ruter matcher filtrene" : "Ingen turer funnet"}
        </p>
      )}

      {!isLoading && filteredRoutes.length > 0 && (
        <>
          <p className="mb-3 text-sm text-white/50">
            {near
              ? `${filteredRoutes.length} ruter nær valgt sted`
              : clientFiltered
                ? `${filteredRoutes.length} av ${routes.length} ruter`
                : `${routes.length} ruter`}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRoutes.map((route) => {
              const grading = route.gradingAb;
              const gradingStyle = grading ? GRADING_STYLE[grading] : null;
              const duration = formatDuration(route.durationDaysAb, route.durationHoursAb, route.durationMinutesAb);
              const distance = formatDistance(route.distance);
              const description = route.descriptionAb ? stripHtml(route.descriptionAb).slice(0, 120) : null;
              return (
                <div key={route.id} className="flex flex-col gap-2 rounded-xl bg-white/10 p-4 hover:bg-white/15">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug text-white">{route.name}</h3>
                    {grading && gradingStyle && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${gradingStyle.badge}`}>
                        {GRADING_LABEL[grading]}
                      </span>
                    )}
                  </div>

                  {(route.placeA ?? route.placeB) && (
                    <p className="text-xs text-white/50">
                      {[route.placeA, route.placeB].filter(Boolean).join(" → ")}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-sm text-white/70">
                    {distance && <span>📍 {distance}</span>}
                    {duration && <span>⏱ {duration}</span>}
                    {route.elevationGainA && <span>⬆ {route.elevationGainA} m</span>}
                  </div>

                  {description && (
                    <p className="line-clamp-2 text-xs text-white/50">{description}…</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
