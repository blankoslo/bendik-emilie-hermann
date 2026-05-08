"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { api } from "~/trpc/react";

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return format(new Date(d), "d. MMM yyyy", { locale: nb });
}

export function TripListClient() {
  const { user } = useUser();
  const { data: trips, isLoading } = api.trips.listByUser.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id },
  );

  if (!user) {
    return (
      <p className="text-center text-white/50">Logg inn for å se turer.</p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white/10" />
        ))}
      </div>
    );
  }

  if (!trips?.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-white/50">Ingen turer ennå.</p>
        <Link
          href="/tur/ny"
          className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          Planlegg første tur
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {trips.map((trip) => {
        const start = formatDate(trip.startDate);
        const end = formatDate(trip.endDate);
        const dateRange = start && end ? `${start} → ${end}` : start ?? null;
        const days = trip.startDate && trip.endDate
          ? Math.round(
              (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                86400000,
            ) + 1
          : null;

        return (
          <Link
            key={trip.id}
            href={`/tur/${trip.id}`}
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-4 hover:bg-white/15"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-white">{trip.name}</span>
              {days && (
                <span className="shrink-0 rounded-full bg-green-700/30 px-2 py-0.5 text-xs text-green-300">
                  {days} dag{days !== 1 ? "er" : ""}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
              {trip.group?.name && <span>👥 {trip.group.name}</span>}
              {trip.routeName && <span>🗺 {trip.routeName}</span>}
              {dateRange && <span>📅 {dateRange}</span>}
              {trip.cabins.length > 0 && (
                <span>🏕 {trip.cabins.length} hytte{trip.cabins.length !== 1 ? "r" : ""}</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
