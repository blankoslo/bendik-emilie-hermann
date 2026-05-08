"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { type ServiceLevel } from "~/server/api/routers/cabins";

interface Cabin {
  id: number;
  name: string;
  serviceLevel: string;
  bedsStaffed: number;
  bedsSelfService: number;
  bedsNoService: number;
  description: string | null;
}
interface CabinsConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  edges: { cursor: string; node: Cabin }[];
}

const FILTERS: { value: ServiceLevel; label: string; color: string; active: string }[] = [
  { value: "STAFFED",          label: "Betjent",      color: "bg-white/10 text-white/60", active: "bg-green-500/30 text-green-300 ring-1 ring-green-400/40" },
  { value: "SELF_SERVICE",     label: "Selvbetjent",  color: "bg-white/10 text-white/60", active: "bg-blue-500/30 text-blue-300 ring-1 ring-blue-400/40" },
  { value: "NO_SERVICE",       label: "Ubetjent",     color: "bg-white/10 text-white/60", active: "bg-gray-500/30 text-gray-200 ring-1 ring-gray-400/40" },
  { value: "RENTAL",           label: "Utleie",       color: "bg-white/10 text-white/60", active: "bg-purple-500/30 text-purple-300 ring-1 ring-purple-400/40" },
  { value: "EMERGENCY_SHELTER",label: "Nødhytte",     color: "bg-white/10 text-white/60", active: "bg-red-500/30 text-red-300 ring-1 ring-red-400/40" },
];

const SERVICE_BADGE: Record<string, { label: string; color: string }> = {
  STAFFED:           { label: "Betjent",      color: "bg-green-500/20 text-green-300" },
  SELF_SERVICE:      { label: "Selvbetjent",  color: "bg-blue-500/20 text-blue-300" },
  NO_SERVICE:        { label: "Ubetjent",     color: "bg-gray-500/20 text-gray-300" },
  NO_SERVICE_NO_BEDS:{ label: "Dagstur",      color: "bg-yellow-500/20 text-yellow-300" },
  FOOD_SERVICE:      { label: "Matservering", color: "bg-orange-500/20 text-orange-300" },
  EMERGENCY_SHELTER: { label: "Nødhytte",     color: "bg-red-500/20 text-red-300" },
  RENTAL:            { label: "Utleie",       color: "bg-purple-500/20 text-purple-300" },
};

function totalBeds(c: Cabin) {
  return c.bedsStaffed + c.bedsSelfService + c.bedsNoService;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

interface CabinListProps {
  near?: { lon: number; lat: number };
}

export function CabinList({ near }: CabinListProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<ServiceLevel[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  function toggleFilter(value: ServiceLevel) {
    setActiveFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value],
    );
  }

  const commonInput = { first: 20, serviceLevels: activeFilters.length ? activeFilters : undefined };

  const { data: listData, isLoading: listLoading } = api.cabins.list.useQuery(
    commonInput,
    { enabled: !near && debouncedSearch.length === 0 },
  );

  const { data: searchData, isLoading: searchLoading } = api.cabins.search.useQuery(
    { ...commonInput, query: debouncedSearch },
    { enabled: !near && debouncedSearch.length > 0 },
  );

  const { data: nearData, isLoading: nearLoading } = api.cabins.near.useQuery(
    { lon: near?.lon ?? 0, lat: near?.lat ?? 0 },
    { enabled: !!near },
  );

  let cabins: Cabin[];
  let isLoading: boolean;
  let countLabel: string | null = null;

  if (near) {
    const nearItems = (nearData as { cabinsNear?: { distance: number; cabin: Cabin }[] } | undefined)?.cabinsNear ?? [];
    cabins = nearItems.map((r) => r.cabin);
    isLoading = nearLoading;
    if (!nearLoading) countLabel = `${cabins.length} hytter nær valgt sted`;
  } else {
    const raw = debouncedSearch ? searchData : listData;
    const connection = (raw as { cabins: CabinsConnection } | undefined)?.cabins;
    cabins = connection?.edges.map((e) => e.node) ?? [];
    isLoading = debouncedSearch ? searchLoading : listLoading;
    if (!isLoading && connection?.totalCount !== undefined) {
      countLabel = debouncedSearch
        ? `${connection.totalCount} treff`
        : `Viser ${cabins.length} av ${connection.totalCount} hytter`;
    }
  }

  return (
    <section className="w-full max-w-4xl">
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Søk etter hytte..."
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = activeFilters.includes(f.value);
          return (
            <button
              key={f.value}
              onClick={() => toggleFilter(f.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${isActive ? f.active : f.color} hover:brightness-110`}
            >
              {f.label}
            </button>
          );
        })}
        {activeFilters.length > 0 && (
          <button
            onClick={() => setActiveFilters([])}
            className="rounded-full px-3 py-1 text-sm text-white/40 hover:text-white/70"
          >
            Nullstill
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {!isLoading && cabins.length === 0 && (
        <p className="text-center text-white/50">Ingen hytter funnet</p>
      )}

      {!isLoading && cabins.length > 0 && (
        <>
          {countLabel && (
            <p className="mb-3 text-sm text-white/50">{countLabel}</p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cabins.map((cabin) => {
              const svc = SERVICE_BADGE[cabin.serviceLevel] ?? { label: cabin.serviceLevel, color: "bg-white/10 text-white/60" };
              const beds = totalBeds(cabin);
              return (
                <div key={cabin.id} className="flex flex-col gap-2 rounded-xl bg-white/10 p-4 hover:bg-white/15">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug text-white">{cabin.name}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${svc.color}`}>
                      {svc.label}
                    </span>
                  </div>
                  {beds > 0 && <p className="text-sm text-white/60">{beds} senger</p>}
                  {cabin.description && (
                    <p className="line-clamp-2 text-xs text-white/50">{stripHtml(cabin.description)}</p>
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
