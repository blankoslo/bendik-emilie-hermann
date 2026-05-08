"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { TripMap, type RouteForMap, type CabinForMap } from "./trip-map";
import { RouteList } from "./route-list";
import { CabinList } from "./cabin-list";

interface RoutesConnection {
  edges: { node: RouteForMap }[];
}

interface CabinsConnection {
  edges: { node: CabinForMap }[];
}

export function TripDashboard() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lon: number;
    lat: number;
  } | null>(null);

  const { data: mapRoutesData } = api.routes.list.useQuery({ first: 50 });
  const mapRoutes =
    (mapRoutesData as { routes?: RoutesConnection } | undefined)?.routes?.edges?.map(
      (e) => e.node,
    ) ?? [];

  const { data: mapCabinsData } = api.cabins.list.useQuery({ first: 50 });
  const mapCabins =
    (mapCabinsData as { cabins?: CabinsConnection } | undefined)?.cabins?.edges?.map(
      (e) => e.node,
    ) ?? [];

  return (
    <>
      <TripMap
        onLocationSelect={(lon, lat) => setSelectedLocation({ lon, lat })}
        selectedLocation={selectedLocation}
        routes={mapRoutes}
        cabins={mapCabins}
      />

      {selectedLocation && (
        <button
          onClick={() => setSelectedLocation(null)}
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/20 hover:text-white"
        >
          ✕ Vis alle turer
        </button>
      )}

      <RouteList near={selectedLocation ?? undefined} />
      <CabinList near={selectedLocation ?? undefined} />
    </>
  );
}
