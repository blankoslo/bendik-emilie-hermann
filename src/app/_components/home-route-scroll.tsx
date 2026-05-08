"use client";

import Image from "next/image";
import { api } from "~/trpc/react";

const PHOTOS = [
  "photo-1506905925346-21bda4d32df4", // mountain lake norway
  "photo-1464822759023-fed622ff2c3b", // forest trail
  "photo-1551632811-561732d1e306", // hiking ridge
  "photo-1486870591958-9b9d0d1dda99", // snowy peak
  "photo-1519681393784-d120267933ba", // stars mountain
  "photo-1454942901704-3c44c11b2ad1", // fjord norway
  "photo-1476514525535-07fb3b4ae5f1", // green hills
  "photo-1510227272981-87123e259b17", // autumn hiking
  "photo-1501854140801-50d01698950b", // aerial mountains
  "photo-1483728642387-6c3bdd6c93e5", // rocky summit
  "photo-1527489377706-5bf97e608852", // mountain meadow
  "photo-1544198365-f5d60b6d8190", // fjord view
];

function photoUrl(idx: number) {
  const id = PHOTOS[idx % PHOTOS.length];
  return `https://images.unsplash.com/${id}?w=352&h=288&fit=crop&q=70`;
}

type Grading = "EASY" | "MODERATE" | "TOUGH" | "VERY_TOUGH";

const GRADING_LABEL: Record<Grading, string> = {
  EASY: "lett",
  MODERATE: "middels",
  TOUGH: "krevende",
  VERY_TOUGH: "svært krevende",
};

interface Route {
  id: number;
  name: string;
  gradingAb: Grading | null;
  durationDaysAb: number | null;
  durationHoursAb: number | null;
}

interface RoutesConnection {
  edges: { node: Route }[];
}

function formatDuration(days: number | null, hours: number | null) {
  if (days && days > 0) return `${days} dag${days !== 1 ? "er" : ""}`;
  if (hours && hours > 0) return `${hours} t`;
  return null;
}

interface Props {
  title: string;
  gradings?: ("EASY" | "MODERATE" | "TOUGH" | "VERY_TOUGH")[];
}

export function HomeRouteScroll({ title, gradings }: Props) {
  const { data, isLoading } = api.routes.list.useQuery({ first: 12, gradings });

  const routes =
    (data as { routes?: RoutesConnection } | undefined)?.routes?.edges.map(
      (e) => e.node,
    ) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="px-6 text-lg font-bold text-white">{title}</h2>
      <div className="flex gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none]">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 w-44 shrink-0 animate-pulse rounded-2xl bg-white/10"
            />
          ))}
        {!isLoading &&
          routes.map((route, i) => {
            const duration = formatDuration(route.durationDaysAb, route.durationHoursAb);
            const grading = route.gradingAb ? GRADING_LABEL[route.gradingAb] : null;
            return (
              <div key={route.id} className="flex w-44 shrink-0 flex-col gap-2">
                <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-white/10">
                  <Image
                    src={photoUrl(i)}
                    alt={route.name}
                    fill
                    className="object-cover"
                    sizes="176px"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="line-clamp-1 text-sm font-semibold leading-snug text-white">
                    {route.name}
                  </p>
                  <p className="text-xs text-white/50">
                    {[duration, grading].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
