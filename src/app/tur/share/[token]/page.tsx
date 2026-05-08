import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { HydrateClient, caller } from "~/trpc/server";
import { TripWeather } from "~/app/_components/trip-weather";

interface Props {
  params: Promise<{ token: string }>;
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return format(new Date(d), "d. MMMM yyyy", { locale: nb });
}

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const trip = await caller.trips.getByShareToken({ token });
  if (!trip) return {};
  return {
    title: `${trip.name} – Friluftskompis`,
    description: `Du er invitert til ${trip.name}! Bli med på tur.`,
    openGraph: {
      title: `${trip.name} – Bli med på tur! 🏔`,
      description: `${trip.routeName ? `Rute: ${trip.routeName}. ` : ""}${
        trip.startDate ? `Avreise: ${formatDate(trip.startDate)}. ` : ""
      }Planlagt med Friluftskompis.`,
      type: "website",
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const trip = await caller.trips.getByShareToken({ token });

  if (!trip) notFound();

  const sortedCabins = [...(trip.cabins ?? [])].sort((a, b) => a.dayNumber - b.dayNumber);
  const days = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1
    : null;

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
        <header className="flex h-16 items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight">🏔️ Friluftskompis</span>
          <Link
            href="/"
            className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            Planlegg din tur
          </Link>
        </header>

        <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
          <div className="rounded-2xl border border-green-400/20 bg-green-900/20 p-6 text-center">
            <p className="mb-2 text-sm text-green-300">Du er invitert til tur!</p>
            <h1 className="text-3xl font-extrabold text-white">{trip.name}</h1>
            {trip.group?.name && (
              <p className="mt-2 text-white/60">med {trip.group.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              {trip.routeName && <span>🗺 {trip.routeName}</span>}
              {trip.startDate && trip.endDate && (
                <span>📅 {formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
              )}
              {days && <span>⏱ {days} dag{days !== 1 ? "er" : ""}</span>}
              {trip.group?.members && (
                <span>👥 {trip.group.members.length} deltaker{trip.group.members.length !== 1 ? "e" : ""}</span>
              )}
            </div>
          </div>

          {trip.routeLat && trip.routeLon && (
            <TripWeather
              lat={trip.routeLat}
              lon={trip.routeLon}
              startDate={trip.startDate ?? undefined}
              endDate={trip.endDate ?? undefined}
            />
          )}

          {sortedCabins.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-white">Dagsplan</h2>
              <div className="flex flex-col gap-2">
                {sortedCabins.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 rounded-xl bg-white/10 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                      {c.dayNumber}
                    </div>
                    <p className="font-medium text-white">{c.cabinName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="mb-3 text-sm text-white/60">Vil du planlegge din neste tur?</p>
            <Link
              href="/"
              className="rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600"
            >
              Prøv Friluftskompis gratis
            </Link>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
