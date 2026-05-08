"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { api } from "~/trpc/react";
import type { SelectedRoute } from "./step-route";
import type { CabinStop } from "./step-cabins";

interface Props {
  groupId: number;
  groupName: string;
  route: SelectedRoute | null;
  selectedCabins: CabinStop[];
  startDate: string | null;
  endDate: string | null;
}

function formatDate(d: string | null) {
  if (!d) return "–";
  return format(new Date(d), "d. MMMM yyyy", { locale: nb });
}

const GRADING_LABEL: Record<string, string> = {
  EASY: "Lett",
  MODERATE: "Middels",
  TOUGH: "Krevende",
  VERY_TOUGH: "Svært krevende",
};

export function StepConfirm({ groupId, groupName, route, selectedCabins, startDate, endDate }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const createTrip = api.trips.create.useMutation({
    onSuccess: (trip) => {
      if (trip?.id) router.push(`/tur/${trip.id}`);
    },
  });

  const tripName = route?.name
    ? `${route.name}${startDate ? ` – ${format(new Date(startDate), "d. MMM", { locale: nb })}` : ""}`
    : "Ny tur";

  const sortedCabins = [...selectedCabins].sort((a, b) => a.dayNumber - b.dayNumber);

  const days = startDate && endDate
    ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1
    : null;

  function handleCreate() {
    if (!user) return;
    createTrip.mutate({
      groupId,
      name: tripName,
      routeId: route?.id,
      routeName: route?.name,
      routeLon: route?.startLon ?? undefined,
      routeLat: route?.startLat ?? undefined,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
      createdById: user.id,
      cabins: sortedCabins,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Bekreft turen</h2>
        <p className="mt-1 text-sm text-white/50">Se over detaljer og opprett</p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <Row label="Gruppe" value={groupName} />
        {route && (
          <>
            <Row label="Rute" value={route.name} />
            {(route.placeA ?? route.placeB) && (
              <Row label="Fra → Til" value={[route.placeA, route.placeB].filter(Boolean).join(" → ")} />
            )}
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              {route.distance && <span>📍 {(route.distance / 1000).toFixed(1)} km</span>}
              {route.elevationGain && <span>⬆ {route.elevationGain} m stigning</span>}
              {route.elevationMax && <span>🏔 {route.elevationMax} m topp</span>}
              {route.gradingAb && <span>🎯 {GRADING_LABEL[route.gradingAb] ?? route.gradingAb}</span>}
            </div>
          </>
        )}
        <Row label="Avreise" value={formatDate(startDate)} />
        <Row label="Hjemreise" value={formatDate(endDate)} />
        {days && <Row label="Varighet" value={`${days} dag${days !== 1 ? "er" : ""}`} />}
      </div>

      {sortedCabins.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-white/70">Dagsplan</p>
          <div className="flex flex-col gap-2">
            {sortedCabins.map((c, i) => (
              <div key={c.cabinId} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                  {c.dayNumber}
                </div>
                <div>
                  <p className="font-medium text-white">{c.cabinName}</p>
                  <p className="text-xs text-white/40">
                    {i === 0 ? "Startstopp" : `Dag ${c.dayNumber}`}
                    {c.beds > 0 ? ` · ${c.beds} senger` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {createTrip.isError && (
        <p className="rounded-xl bg-red-900/30 px-4 py-3 text-sm text-red-300">
          Noe gikk galt: {createTrip.error.message}
        </p>
      )}

      <button
        onClick={handleCreate}
        disabled={createTrip.isPending || !user}
        className="w-full rounded-xl bg-green-700 py-3 text-base font-semibold text-white hover:bg-green-600 disabled:opacity-50"
      >
        {createTrip.isPending ? "Oppretter tur…" : "Opprett tur 🏔"}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-sm text-white/50">{label}</span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}
