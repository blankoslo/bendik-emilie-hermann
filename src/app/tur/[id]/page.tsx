import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { HydrateClient, caller } from "~/trpc/server";
import { TripPackingList } from "~/app/_components/trip-packing-list";
import { TripShareButton } from "~/app/_components/trip-share-button";
import { TripWeather } from "~/app/_components/trip-weather";
import { TripExpenses } from "~/app/_components/trip-expenses";
import { TripRouteMap } from "~/app/_components/trip-route-map";

interface Props {
  params: Promise<{ id: string }>;
}


function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return format(new Date(d), "d. MMMM yyyy", { locale: nb });
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const trip = await caller.trips.getById({ id: Number(id) });
  if (!trip) return {};
  return {
    title: `${trip.name} – Friluftskompis`,
    description: `Planlagt tur${trip.routeName ? ` langs ${trip.routeName}` : ""}${trip.startDate ? ` fra ${formatDate(trip.startDate)}` : ""}`,
    openGraph: {
      title: trip.name,
      description: `Bli med på tur! ${trip.routeName ?? ""} – Friluftskompis`,
    },
  };
}

export default async function TurPage({ params }: Props) {
  const { id } = await params;
  const trip = await caller.trips.getById({ id: Number(id) });

  if (!trip) notFound();

  const sortedCabins = [...(trip.cabins ?? [])].sort((a, b) => a.dayNumber - b.dayNumber);
  const days = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1
    : null;

  const shareUrl = trip.shareToken
    ? `${process.env.NEXT_PUBLIC_URL ?? ""}/tur/share/${trip.shareToken}`
    : null;

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
        <header className="flex h-16 items-center gap-4 px-6">
          <Link href="/" className="text-white/50 hover:text-white">
            ← Hjem
          </Link>
          <span className="truncate text-lg font-bold tracking-tight">{trip.name}</span>
        </header>

        <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
          {/* Trip header */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-extrabold text-white">{trip.name}</h1>

            <div className="flex flex-wrap gap-3 text-sm text-white/60">
              {trip.group?.name && <span>👥 {trip.group.name}</span>}
              {trip.routeName && <span>🗺 {trip.routeName}</span>}
              {trip.startDate && trip.endDate && (
                <span>📅 {formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
              )}
              {days && <span>⏱ {days} dag{days !== 1 ? "er" : ""}</span>}
            </div>

            {shareUrl && <TripShareButton shareUrl={shareUrl} />}
          </div>

          {/* Map — route + cabins in area */}
          {trip.routeLat && trip.routeLon && (
            <TripRouteMap
              routeLon={trip.routeLon}
              routeLat={trip.routeLat}
              routeId={trip.routeId}
              tripCabins={sortedCabins.map((c) => ({
                cabinId: c.cabinId,
                cabinName: c.cabinName,
                dayNumber: c.dayNumber,
              }))}
            />
          )}

          {/* Weather */}
          {trip.routeLat && trip.routeLon && (
            <TripWeather lat={trip.routeLat} lon={trip.routeLon} startDate={trip.startDate ?? undefined} endDate={trip.endDate ?? undefined} />
          )}

          {/* Day-by-day */}
          {sortedCabins.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-white">Dagsplan</h2>
              <div className="flex flex-col gap-2">
                {sortedCabins.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 rounded-xl bg-white/10 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                      {c.dayNumber}
                    </div>
                    <div>
                      <p className="font-medium text-white">{c.cabinName}</p>
                      <p className="text-xs text-white/40">Dag {c.dayNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group members */}
          {trip.group?.members && trip.group.members.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-white">Deltakere</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {trip.group.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      {m.experienceLevel && (
                        <p className="text-xs text-white/40">
                          {m.experienceLevel === "BEGINNER" ? "Nybegynner"
                            : m.experienceLevel === "INTERMEDIATE" ? "Middels"
                            : m.experienceLevel === "EXPERIENCED" ? "Erfaren"
                            : "Ekspert"}
                          {m.age ? ` · ${m.age} år` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Packing list */}
          <TripPackingList tripId={trip.id} />

          {/* Expense settlement */}
          {trip.group?.members && trip.group.members.length > 0 && (
            <TripExpenses
              tripId={trip.id}
              members={trip.group.members.map((m) => ({ name: m.name }))}
            />
          )}
        </main>
      </div>
    </HydrateClient>
  );
}
