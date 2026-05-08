"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { TripMap } from "../_components/trip-map";
import type { RouteForMap, CabinForMap } from "../_components/trip-map";

interface Route {
  id: number;
  name: string;
  gradingAb: string | null;
  distance: number | null;
  durationHoursAb: number | null;
  durationMinutesAb: number | null;
  placeA: string | null;
  placeB: string | null;
  geojson: unknown;
}

const GRADING_COLOR: Record<string, string> = {
  EASY: "bg-green-100 text-green-700",
  MODERATE: "bg-blue-100 text-blue-700",
  TOUGH: "bg-orange-100 text-orange-700",
  VERY_TOUGH: "bg-red-100 text-red-700",
};

const GRADING_LABEL: Record<string, string> = {
  EASY: "Lett",
  MODERATE: "Middels",
  TOUGH: "Krevende",
  VERY_TOUGH: "Svært krevende",
};

function RouteCard({ route }: { route: Route }) {
  const distance = route.distance
    ? `${(route.distance / 1000).toFixed(1)} km`
    : null;
  const duration = [
    route.durationHoursAb ? `${route.durationHoursAb}t` : null,
    route.durationMinutesAb ? `${route.durationMinutesAb}min` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-36 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
      <div className="flex h-24 items-center justify-center bg-gray-200 text-2xl">
        🏔️
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-semibold text-gray-800">
          {route.name}
        </p>
        <p className="text-xs text-gray-400">{distance ?? duration ?? "—"}</p>
        {route.gradingAb && (
          <span
            className={`mt-1 inline-block rounded px-1 text-xs ${GRADING_COLOR[route.gradingAb] ?? ""}`}
          >
            {GRADING_LABEL[route.gradingAb] ?? route.gradingAb}
          </span>
        )}
      </div>
    </div>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 overflow-x-auto px-4 pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}

type RoutesResponse = {
  routes: { edges: { node: Route }[] };
};
type NearRoutesResponse = {
  routesNear: { route: Route }[];
};
type CabinsResponse = {
  cabins: {
    edges: { node: { id: number; name: string; serviceLevel: string; geojson: unknown } }[];
  };
};

export default function LandingPage() {
  const { user } = useUser();
  const firstName = user?.firstName ?? "deg";
  const [location, setLocation] = useState<{ lon: number; lat: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lon: number;
    lat: number;
  } | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLocation({ lon: pos.coords.longitude, lat: pos.coords.latitude });
    });
  }, []);

  const { data: popularData } = api.routes.list.useQuery({ first: 12 });
  const { data: nearData } = api.routes.near.useQuery(
    { lon: location?.lon ?? 0, lat: location?.lat ?? 0 },
    { enabled: !!location },
  );
  const { data: cabinsData } = api.cabins.list.useQuery({ first: 50 });

  const popularRoutes =
    (popularData as RoutesResponse | undefined)?.routes?.edges?.map(
      (e) => e.node,
    ) ?? [];
  const nearRoutes =
    (nearData as NearRoutesResponse | undefined)?.routesNear?.map(
      (r) => r.route,
    ) ?? [];
  const cabins: CabinForMap[] =
    (cabinsData as CabinsResponse | undefined)?.cabins?.edges?.map(
      (e) => e.node,
    ) ?? [];

  const mapRoutes: RouteForMap[] = popularRoutes.map((r) => ({
    id: r.id,
    name: r.name,
    gradingAb: r.gradingAb,
    distance: r.distance,
    durationHoursAb: r.durationHoursAb,
    durationMinutesAb: r.durationMinutesAb,
    geojson: r.geojson,
  }));

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        <p className="mb-2 px-1 text-sm text-gray-400">hjem</p>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <h1 className="text-xl font-semibold">Hei {firstName}!</h1>
            <div className="flex flex-col items-center gap-0.5">
              <UserButton />
              <span className="text-xs text-gray-400">konto</span>
            </div>
          </div>

          {/* Map */}
          <div className="mx-4 overflow-hidden rounded-xl">
            <TripMap
              onLocationSelect={(lon, lat) =>
                setSelectedLocation({ lon, lat })
              }
              selectedLocation={selectedLocation}
              routes={mapRoutes}
              cabins={cabins}
            />
          </div>

          {/* CTA */}
          <div className="px-4 py-4">
            <Link
              href="/turer/ny"
              className="block w-full rounded-xl bg-gray-100 py-4 text-center font-medium text-gray-800 transition-colors hover:bg-gray-200"
            >
              Planlegg en tur
            </Link>
          </div>

          {/* Populære turer */}
          <div className="pb-4">
            <h2 className="mb-3 px-4 font-semibold text-gray-800">
              Populære turer
            </h2>
            <HorizontalScroll>
              {popularRoutes.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-36 w-36 flex-shrink-0 animate-pulse rounded-xl bg-gray-100"
                    />
                  ))
                : popularRoutes.map((r) => (
                    <RouteCard key={r.id} route={r} />
                  ))}
            </HorizontalScroll>
          </div>

          {/* Turer nær deg */}
          <div className="pb-6">
            <h2 className="mb-3 px-4 font-semibold text-gray-800">
              Turer nær deg
            </h2>
            <HorizontalScroll>
              {!location ? (
                <p className="px-1 text-sm text-gray-400">
                  Gi tilgang til posisjon for å se turer i nærheten
                </p>
              ) : nearRoutes.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 w-36 flex-shrink-0 animate-pulse rounded-xl bg-gray-100"
                  />
                ))
              ) : (
                nearRoutes.map((r) => <RouteCard key={r.id} route={r} />)
              )}
            </HorizontalScroll>
          </div>
        </div>

        {/* Bottom nav */}
        <nav className="mt-4 flex justify-around rounded-2xl bg-white px-6 py-4 shadow-sm">
          <Link href="/landing" className="text-sm font-bold text-black">
            hjem
          </Link>
          <Link href="/turer" className="text-sm text-gray-500">
            turer
          </Link>
          <Link href="/familie" className="text-sm text-gray-500">
            familien
          </Link>
        </nav>
      </div>
    </div>
  );
}
