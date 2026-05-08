import Link from "next/link";
import { TripListClient } from "~/app/_components/trip-list-client";

export default function TurerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
      <header className="flex h-16 items-center justify-between px-6">
        <span className="text-lg font-bold tracking-tight">Mine turer</span>
        <Link
          href="/tur/ny"
          className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          + Ny tur
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <TripListClient />
      </main>
    </div>
  );
}
